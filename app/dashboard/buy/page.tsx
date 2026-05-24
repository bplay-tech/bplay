import { verifySession } from "@/lib/dal";
import { getExchangeRate } from "@/lib/exchange";
import { getUserById } from "@/db/queries/users";
import { getAffiliationByReferredUser } from "@/db/queries/affiliations";
import { getPartnerTierById } from "@/db/queries/partner-tiers";
import { BuyBplaySection } from "@/features/purchases/components/BuyBplaySection";
import { WalletActions } from "@/components/wallet/WalletActions";

export default async function BuyPage() {
  const session = await verifySession();
  const [rate, user] = await Promise.all([
    getExchangeRate(),
    getUserById(session.id),
  ]);

  const rateNum = parseFloat(rate.rate);
  const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_USDC_ADDRESS ?? "";
  const usdcContractAddress = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS ?? "";
  const transferAddress = user?.transferAddress ?? null;
  const recipientAddress = transferAddress ?? treasuryAddress;

  const affiliation = session.role !== "USER" ? await getAffiliationByReferredUser(session.id) : null;
  let partnerCommissionRate: number | undefined;
  if (affiliation) {
    const affiliate = await getUserById(affiliation.affiliateId);
    if (affiliate) {
      const tier = await getPartnerTierById(affiliate.partnerTierId);
      let topRate = tier ? parseFloat(tier.commissionRate) : 0;

      // Walk up to Admin — the true total provision = Admin's rate (Admin gets the diff)
      if (affiliate.role === "SALES") {
        const adminAffiliation = await getAffiliationByReferredUser(affiliate.id);
        if (adminAffiliation) {
          const adminUser = await getUserById(adminAffiliation.affiliateId);
          if (adminUser) {
            const adminTier = await getPartnerTierById(adminUser.partnerTierId);
            if (adminTier) {
              const adminRate = parseFloat(adminTier.commissionRate);
              if (adminRate > topRate) topRate = adminRate;
            }
          }
        }
      }

      partnerCommissionRate = topRate;
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full sm:max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Buy BPLAY</h1>
        <p className="text-muted mt-1">Purchase BPLAY tokens using USDC</p>
      </div>

      <BuyBplaySection
        rate={rateNum}
        recipientAddress={recipientAddress}
        usdcContractAddress={usdcContractAddress}
        partnerCommissionRate={partnerCommissionRate}
      />

      <WalletActions />
    </div>
  );
}
