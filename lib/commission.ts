import { getAffiliationByReferredUser } from "@/db/queries/affiliations";
import { getUserById, updateUser, incrementCumulatedCommissions } from "@/db/queries/users";
import { getAllPartnerTiers, getPartnerTierById } from "@/db/queries/partner-tiers";
import { createTransaction } from "@/db/queries/transactions";
import { getBplayPurchaseById, getAffiliateTurnoverUsd } from "@/db/queries/bplay-purchases";

export async function processAffiliateCommission(purchaseId: string): Promise<void> {
  const purchase = await getBplayPurchaseById(purchaseId);
  if (!purchase) return;

  const salesAffiliation = await getAffiliationByReferredUser(purchase.userId);
  if (!salesAffiliation) return;

  const salesAffiliate = await getUserById(salesAffiliation.affiliateId);
  if (!salesAffiliate) return;

  const salesTier = await getPartnerTierById(salesAffiliate.partnerTierId);
  if (!salesTier) return;

  const usdcAmount = parseFloat(purchase.usdcAmount);
  const salesRate = parseFloat(salesTier.commissionRate);

  if (salesAffiliate.role === "SALES") {
    const salesCommission = (usdcAmount * salesRate) / 100;
    await createTransaction({
      userId: salesAffiliation.affiliateId,
      type: "REFERRAL",
      amount: salesCommission.toFixed(2),
      buyerWallet: purchase.buyerWallet,
      txHash: purchase.txHash ?? null,
      status: "confirmed",
      notes: `${salesRate}% commission on $${usdcAmount} purchase (${salesTier.name} tier)`,
    });
    await incrementCumulatedCommissions(salesAffiliation.affiliateId, salesCommission);

    const adminAffiliation = await getAffiliationByReferredUser(salesAffiliation.affiliateId);
    if (adminAffiliation) {
      const adminAffiliate = await getUserById(adminAffiliation.affiliateId);
      if (adminAffiliate) {
        const adminTier = await getPartnerTierById(adminAffiliate.partnerTierId);
        if (adminTier) {
          const adminRate = parseFloat(adminTier.commissionRate);
          const diffRate = adminRate - salesRate;
          if (diffRate > 0) {
            const adminCommission = (usdcAmount * diffRate) / 100;
            await createTransaction({
              userId: adminAffiliation.affiliateId,
              type: "REFERRAL",
              amount: adminCommission.toFixed(2),
              buyerWallet: purchase.buyerWallet,
              txHash: purchase.txHash ?? null,
              status: "confirmed",
              notes: `${diffRate.toFixed(2)}% commission diff (${adminTier.name} ${adminRate}% − ${salesTier.name} ${salesRate}%) on $${usdcAmount} purchase`,
            });
            await incrementCumulatedCommissions(adminAffiliation.affiliateId, adminCommission);
          }
          await upgradeTierIfEligible(adminAffiliation.affiliateId);
        }
      }
    }

    await upgradeTierIfEligible(salesAffiliation.affiliateId);
  } else {
    const adminCommission = (usdcAmount * salesRate) / 100;
    await createTransaction({
      userId: salesAffiliation.affiliateId,
      type: "REFERRAL",
      amount: adminCommission.toFixed(2),
      buyerWallet: purchase.buyerWallet,
      txHash: purchase.txHash ?? null,
      status: "confirmed",
      notes: `${salesRate}% commission on $${usdcAmount} purchase (${salesTier.name} tier)`,
    });
    await incrementCumulatedCommissions(salesAffiliation.affiliateId, adminCommission);
    await upgradeTierIfEligible(salesAffiliation.affiliateId);
  }
}

async function upgradeTierIfEligible(userId: string): Promise<void> {
  const user = await getUserById(userId);
  if (!user) return;

  const turnover = await getAffiliateTurnoverUsd(userId);
  const allTiers = await getAllPartnerTiers(); // ordered by minTurnoverUsd ASC

  // Highest tier the user has earned by turnover
  let earnedTier = allTiers[0];
  for (const tier of allTiers) {
    if (turnover >= tier.minTurnoverUsd) earnedTier = tier;
  }

  // Current tier threshold — preserves admin-assigned tiers above turnover level
  const currentTier = allTiers.find((t) => t.id === user.partnerTierId);
  const currentThreshold = currentTier?.minTurnoverUsd ?? 0;

  // Only upgrade — never downgrade a tier set manually by an admin
  if (earnedTier && earnedTier.minTurnoverUsd > currentThreshold) {
    await updateUser(userId, { partnerTierId: earnedTier.id });
  }
}
