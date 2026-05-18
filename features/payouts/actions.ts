"use server";

import { revalidatePath } from "next/cache";
import { verifySession, verifyRole } from "@/lib/dal";
import {
  createPayoutRequest,
  getPendingPayoutByUser,
  approvePayoutRequest,
  rejectPayoutRequest,
} from "@/db/queries/payout-requests";
import { getAvailableBalance } from "@/db/queries/transactions";
import { getSettingsByUser } from "@/db/queries/user-settings";
import { walletAddressSchema } from "@/lib/zod";

export async function requestPayoutAction(
  _prev: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const user = await verifySession();
  const amount = parseFloat(formData.get("amount") as string);
  const method = formData.get("payoutMethod") as "USDC" | "BANK_TRANSFER";
  const walletAddress = formData.get("walletAddress") as string | null;

  if (isNaN(amount) || amount <= 0) {
    return { error: "Amount must be greater than $0." };
  }

  const balance = await getAvailableBalance(user.id);
  if (amount > balance) {
    return { error: `Amount exceeds available balance of ${balance.toFixed(2)}.` };
  }

  const existing = await getPendingPayoutByUser(user.id);
  if (existing) {
    return { error: "You already have a pending payout request." };
  }

  if (method === "USDC") {
    const parsed = walletAddressSchema.safeParse(walletAddress?.trim());
    if (!parsed.success) return { error: "A valid Ethereum wallet address is required." };
  }

  await createPayoutRequest({
    userId: user.id,
    amount: String(amount),
    payoutMethod: method,
    walletAddress: walletAddress?.trim() || null,
  });

  revalidatePath("/dashboard/payouts");
  return { success: true };
}

export async function approvePayoutAction(payoutId: string, txHash?: string): Promise<void> {
  const user = await verifyRole(["SUPER_ADMIN"]);
  await approvePayoutRequest(payoutId, user.id, txHash);
  revalidatePath("/dashboard/payouts");
}

export async function rejectPayoutAction(payoutId: string): Promise<void> {
  const user = await verifyRole(["SUPER_ADMIN"]);
  await rejectPayoutRequest(payoutId, user.id);
  revalidatePath("/dashboard/payouts");
}
