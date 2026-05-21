import { verifySession } from "@/lib/dal";
import { getExchangeRate } from "@/lib/exchange";
import { getUserById } from "@/db/queries/users";
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
      />

      <WalletActions />
    </div>
  );
}
