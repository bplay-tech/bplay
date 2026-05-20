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
import { getAffiliationByReferredUser } from "@/db/queries/affiliations";
import { getUserById, getSuperAdmin } from "@/db/queries/users";
import { getPartnerTierById } from "@/db/queries/partner-tiers";
import { createTransaction } from "@/db/queries/transactions";

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
  const user = await verifySession();
  const purchase = await getBplayPurchaseById(purchaseId);
  if (!purchase || purchase.userId !== user.id) return; // silently ignore — prevents spoofing
  await updateBplayPurchaseTxHash(purchaseId, txHash);
}

export async function approvePurchaseAction(purchaseId: string): Promise<void> {
  const admin = await verifyRole(["SUPER_ADMIN"]);
  // Create commission first — if it throws, purchase stays unapproved (consistent state)
  await maybeCreateAffiliateCommission(purchaseId);
  await approveBplayPurchase(purchaseId, admin.id);
  revalidatePath("/dashboard/purchases");
}

export async function rejectPurchaseAction(purchaseId: string): Promise<void> {
  await verifyRole(["SUPER_ADMIN"]);
  await rejectBplayPurchase(purchaseId);
  revalidatePath("/dashboard/purchases");
}

async function maybeCreateAffiliateCommission(purchaseId: string): Promise<void> {
  const purchase = await getBplayPurchaseById(purchaseId);
  if (!purchase) return;

  const affiliation = await getAffiliationByReferredUser(purchase.userId);
  if (!affiliation) return;

  const affiliate = await getUserById(affiliation.affiliateId);
  if (!affiliate) return;

  const tier = await getPartnerTierById(affiliate.partnerTierId);
  if (!tier) return;

  const commissionRate = parseFloat(tier.commissionRate);
  const usdcAmount = parseFloat(purchase.usdcAmount);
  const totalCommission = (usdcAmount * commissionRate) / 100;

  if (affiliate.role === "SALES") {
    const half = (totalCommission / 2).toFixed(2);
    const baseNote = `${commissionRate}% commission (50% split) on $${usdcAmount} purchase`;

    await createTransaction({
      userId: affiliation.affiliateId,
      type: "REFERRAL",
      amount: half,
      buyerWallet: purchase.buyerWallet,
      txHash: purchase.txHash ?? null,
      status: "confirmed",
      notes: baseNote,
    });

    const admin = await getSuperAdmin();
    if (admin) {
      await createTransaction({
        userId: admin.id,
        type: "REFERRAL",
        amount: half,
        buyerWallet: purchase.buyerWallet,
        txHash: purchase.txHash ?? null,
        status: "confirmed",
        notes: `${baseNote} via ${affiliate.name}`,
      });
    }
  } else {
    await createTransaction({
      userId: affiliation.affiliateId,
      type: "REFERRAL",
      amount: totalCommission.toFixed(2),
      buyerWallet: purchase.buyerWallet,
      txHash: purchase.txHash ?? null,
      status: "confirmed",
      notes: `${commissionRate}% commission on $${usdcAmount} purchase`,
    });
  }
}
