"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyRole, verifySession } from "@/lib/dal";
import { createDirectMessage, deleteDirectMessageById, getDirectMessageById } from "@/db/queries/direct-messages";
import { getUserById, getActiveUsersByRole } from "@/db/queries/users";
import { sendDirectMessageEmail } from "@/lib/email";

const sendMessageSchema = z
  .object({
    targetType: z.enum(["INDIVIDUAL", "GROUP"]).default("INDIVIDUAL"),
    toUserId: z.string().uuid("Invalid recipient.").optional().or(z.literal("")),
    targetGroup: z.enum(["ADMIN", "SALES", "USER"]).optional().or(z.literal("")),
    subject: z.string().min(1, "Subject is required.").max(200, "Subject is too long."),
    body: z.string().min(1, "Body is required.").max(5000, "Body is too long."),
    attachmentUrl: z.string().url().optional().or(z.literal("")),
    attachmentName: z.string().max(200).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.targetType === "INDIVIDUAL" && !data.toUserId) {
      ctx.addIssue({ code: "custom", path: ["toUserId"], message: "Select a recipient." });
    }
    if (data.targetType === "GROUP" && !data.targetGroup) {
      ctx.addIssue({ code: "custom", path: ["targetGroup"], message: "Select a target group." });
    }
  });

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 1100;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getRecipientsByGroup(targetGroup: "ADMIN" | "SALES" | "USER") {
  return getActiveUsersByRole(targetGroup);
}

export async function sendDirectMessageAction(
  _prev: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const actor = await verifyRole(["SUPER_ADMIN"]);

  const parsed = sendMessageSchema.safeParse({
    targetType: formData.get("targetType") || "INDIVIDUAL",
    toUserId: formData.get("toUserId") || undefined,
    targetGroup: formData.get("targetGroup") || undefined,
    subject: formData.get("subject"),
    body: formData.get("body"),
    attachmentUrl: formData.get("attachmentUrl") || undefined,
    attachmentName: formData.get("attachmentName") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { targetType, toUserId, targetGroup, subject, body, attachmentUrl, attachmentName } = parsed.data;

  if ((attachmentUrl && !attachmentName) || (!attachmentUrl && attachmentName)) {
    return { error: "Attachment must include both a URL and a filename." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  if (targetType === "GROUP") {
    const allUsers = await getRecipientsByGroup(targetGroup as "ADMIN" | "SALES" | "USER");
    const recipients = allUsers.filter((u) => u.id !== actor.id);
    if (recipients.length === 0) return { error: "No active recipients in the selected group." };

    const messages = await Promise.all(
      recipients.map((u) =>
        createDirectMessage({
          fromUserId: actor.id,
          toUserId: u.id,
          subject,
          body,
          attachmentUrl: attachmentUrl || null,
          attachmentName: attachmentName || null,
        })
      )
    );

    after(async () => {
      for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        if (i > 0) await sleep(BATCH_DELAY_MS);
        const batch = recipients.slice(i, i + BATCH_SIZE);
        await Promise.allSettled(
          batch.map((u, j) =>
            sendDirectMessageEmail(
              u.email,
              u.name,
              actor.name ?? "BPLAY",
              subject,
              messages[i + j].id,
              appUrl
            )
          )
        );
      }
    });

    revalidatePath("/dashboard/messages");
    return { success: true };
  }

  // INDIVIDUAL
  if (!toUserId) return { error: "Select a recipient." };
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
