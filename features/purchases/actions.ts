"use server";

import { revalidatePath } from "next/cache";
import { verifySession, verifyRole } from "@/lib/dal";
import { getExchangeRate } from "@/lib/exchange";
import {
  createBplayPurchase,
  updateBplayPurchaseTxHash,
  approveBplayPurchase,
  rejectBplayPurchase,
} from "@/db/queries/bplay-purchases";

export async function createBplayPurchaseAction(
  usdcAmount: number,
  buyerWallet: string,
  recipientAddress: string
): Promise<{ purchaseId: string; bplayAmount: number }> {
  const user = await verifySession();
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
  await verifySession();
  await updateBplayPurchaseTxHash(purchaseId, txHash);
}

export async function approvePurchaseAction(purchaseId: string): Promise<void> {
  const user = await verifyRole(["SUPER_ADMIN"]);
  await approveBplayPurchase(purchaseId, user.id);
  revalidatePath("/dashboard/purchases");
}

export async function rejectPurchaseAction(purchaseId: string): Promise<void> {
  await verifyRole(["SUPER_ADMIN"]);
  await rejectBplayPurchase(purchaseId);
  revalidatePath("/dashboard/purchases");
}
