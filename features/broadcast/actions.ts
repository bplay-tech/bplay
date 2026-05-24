"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyRole } from "@/lib/dal";
import { createSystemMessage } from "@/db/queries/system-messages";
import { getActiveUserRecipients, getActiveUsersByRole } from "@/db/queries/users";
import { sendBroadcastEmail } from "@/lib/email";

const broadcastSchema = z.object({
  title: z.string().min(1, "Title is required.").max(200, "Title is too long."),
  body: z.string().min(1, "Body is required.").max(5000, "Body is too long."),
  targetGroup: z.enum(["ALL", "ADMIN", "SALES", "USER"]).default("ALL"),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
  attachmentName: z.string().max(200).optional(),
});

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 1100;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getRecipientsByGroup(targetGroup: "ALL" | "ADMIN" | "SALES" | "USER") {
  if (targetGroup === "ALL") return getActiveUserRecipients();
  return getActiveUsersByRole(targetGroup);
}

export async function sendBroadcastMessageAction(
  _prev: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const actor = await verifyRole(["SUPER_ADMIN"]);
  const parsed = broadcastSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    targetGroup: formData.get("targetGroup") || "ALL",
    attachmentUrl: formData.get("attachmentUrl") || undefined,
    attachmentName: formData.get("attachmentName") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const message = await createSystemMessage({
    title: parsed.data.title,
    body: parsed.data.body,
    attachmentUrl: parsed.data.attachmentUrl || null,
    attachmentName: parsed.data.attachmentName || null,
    createdBy: actor.id,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const allUsers = await getRecipientsByGroup(parsed.data.targetGroup);
  const recipients = allUsers.filter((u) => u.id !== actor.id);

  after(async () => {
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      if (i > 0) await sleep(BATCH_DELAY_MS);
      const batch = recipients.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        batch.map((u) => sendBroadcastEmail(u.email, u.name, parsed.data.title, message.id, appUrl))
      );
    }
  });

  revalidatePath("/dashboard/overview");
  revalidatePath("/dashboard/compose");
  return { success: true };
}
