"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { updateUser } from "@/db/queries/users";
import { upsertSettings } from "@/db/queries/user-settings";
import { upsertNotifications } from "@/db/queries/user-notifications";

export async function updateProfileAction(
  _prev: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const user = await verifySession();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required." };
  await updateUser(user.id, { name });
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updatePayoutSettingsAction(
  _prev: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const user = await verifySession();
  const method = formData.get("preferredPayoutMethod") as "USDC" | "BANK_TRANSFER";
  const walletAddress = (formData.get("walletAddress") as string)?.trim() || null;

  if (method === "USDC" && !walletAddress) {
    return { error: "Wallet address is required for USDC payouts." };
  }

  await upsertSettings(user.id, { preferredPayoutMethod: method, walletAddress });
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateNotificationsAction(formData: FormData): Promise<void> {
  const user = await verifySession();
  await upsertNotifications(user.id, {
    newSale: formData.get("newSale") === "true",
    weeklyReport: formData.get("weeklyReport") === "true",
    payoutConfirm: formData.get("payoutConfirm") === "true",
    teamActivity: formData.get("teamActivity") === "true",
  });
}
