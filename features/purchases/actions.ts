"use server";

import { revalidatePath } from "next/cache";
import { verifySession, verifyRole } from "@/lib/dal";
import { getExchangeRate } from "@/lib/exchange";
import {
  createBplayPurchase,
  updateBplayPurchaseTxHash,
  approveBplayPurchase,
  rejectBplayPurchase,
  getBplayPurchaseById,
} from "@/db/queries/bplay-purchases";
import { getUserById } from "@/db/queries/users";
import { isProfileComplete } from "@/lib/profile";
import { processAffiliateCommission } from "@/lib/commission";

export async function createBplayPurchaseAction(
  usdcAmount: number,
  buyerWallet: string,
  recipientAddress: string
): Promise<{ purchaseId: string; bplayAmount: number }> {
  const session = await verifySession();
  const user = await getUserById(session.id);
  if (!user || !isProfileComplete(user)) {
    throw new Error("Profile incomplete. Please complete your profile before purchasing.");
  }
  const rate = await getExchangeRate();
  const rateNum = parseFloat(rate.rate);
  const bplayAmount = usdcAmount * rateNum;

  const purchase = await createBplayPurchase({
    userId: user.id,
    usdcAmount: String(usdcAmount),
    bplayAmount: String(bplayAmount),
    exchangeRate: rate.rate,
    buyerWallet,
    recipientAddress,
  });

  return { purchaseId: purchase.id, bplayAmount };
}

export async function recordTxHashAction(purchaseId: string, txHash: string): Promise<void> {
  const user = await verifySession();
  const purchase = await getBplayPurchaseById(purchaseId);
  if (!purchase || purchase.userId !== user.id) return;
  await updateBplayPurchaseTxHash(purchaseId, txHash);
  await processAffiliateCommission(purchaseId);
  await approveBplayPurchase(purchaseId, null);
  revalidatePath("/dashboard/overview");
  revalidatePath("/dashboard/buy");
}

export async function approvePurchaseAction(purchaseId: string): Promise<void> {
  const admin = await verifyRole(["SUPER_ADMIN"]);
  await processAffiliateCommission(purchaseId);
  await approveBplayPurchase(purchaseId, admin.id);
  revalidatePath("/dashboard/purchases");
}

export async function rejectPurchaseAction(purchaseId: string): Promise<void> {
  await verifyRole(["SUPER_ADMIN"]);
  await rejectBplayPurchase(purchaseId);
  revalidatePath("/dashboard/purchases");
}
