"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyRole, verifySession } from "@/lib/dal";
import { createDirectMessage, deleteDirectMessageById, getDirectMessageById } from "@/db/queries/direct-messages";
import { getUserById } from "@/db/queries/users";
import { sendDirectMessageEmail } from "@/lib/email";

const sendMessageSchema = z.object({
  toUserId: z.string().uuid("Invalid recipient."),
  subject: z.string().min(1, "Subject is required.").max(200, "Subject is too long."),
  body: z.string().min(1, "Body is required.").max(5000, "Body is too long."),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
  attachmentName: z.string().max(200).optional(),
});

export async function sendDirectMessageAction(
  _prev: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const actor = await verifyRole(["SUPER_ADMIN"]);

  const parsed = sendMessageSchema.safeParse({
    toUserId: formData.get("toUserId"),
    subject: formData.get("subject"),
    body: formData.get("body"),
    attachmentUrl: formData.get("attachmentUrl") || undefined,
    attachmentName: formData.get("attachmentName") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { toUserId, subject, body, attachmentUrl, attachmentName } = parsed.data;

  if ((attachmentUrl && !attachmentName) || (!attachmentUrl && attachmentName)) {
    return { error: "Attachment must include both a URL and a filename." };
  }

  if (toUserId === actor.id) return { error: "You cannot message yourself." };

  const recipient = await getUserById(toUserId);
  if (!recipient) return { error: "Recipient not found." };

  const message = await createDirectMessage({
    fromUserId: actor.id,
    toUserId,
    subject,
    body,
    attachmentUrl: attachmentUrl || null,
    attachmentName: attachmentName || null,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  after(async () => {
    try {
      await sendDirectMessageEmail(
        recipient.email,
        recipient.name,
        actor.name ?? "BPLAY",
        subject,
        message.id,
        appUrl
      );
    } catch {
      // email failure should not block the action
    }
  });

  revalidatePath("/dashboard/messages");
  return { success: true };
}

export async function deleteDirectMessageAction(messageId: string): Promise<void> {
  const user = await verifySession();
  const message = await getDirectMessageById(messageId);
  if (!message) return;
  const isRecipient = message.toUserId === user.id;
  const isSender = message.fromUserId === user.id;
  if (!isRecipient && !isSender && user.role !== "SUPER_ADMIN") return;
  await deleteDirectMessageById(messageId);
  revalidatePath("/dashboard/messages");
}

export async function markMessageReadAction(messageId: string): Promise<void> {
  const user = await verifySession();
  const { markDirectMessageRead } = await import("@/db/queries/direct-messages");
  await markDirectMessageRead(messageId, user.id);
  revalidatePath("/dashboard/messages");
  revalidatePath(`/dashboard/messages/${messageId}`);
}
