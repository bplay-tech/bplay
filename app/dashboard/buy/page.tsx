import { verifySession } from "@/lib/dal";
import { getExchangeRate } from "@/lib/exchange";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { QuickBuyButtons } from "@/features/purchases/components/QuickBuyButtons";

export default async function BuyPage() {
  await verifySession();
  const rate = await getExchangeRate();
  const rateNum = parseFloat(rate.rate);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Buy BPLAY</h1>
        <p className="text-muted mt-1">Purchase BPLAY tokens using USDC</p>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-foreground mb-3">Treasury Deposit Address</h2>
        <div className="flex items-center gap-2 rounded-lg border border-card-border bg-bg px-3 py-2">
          <span className="text-sm font-mono text-muted flex-1 truncate">{rate.treasuryAddress}</span>
          <CopyButton text={rate.treasuryAddress} />
        </div>
        <div className="mt-3 rounded-lg bg-warning/10 border border-warning/30 px-3 py-2">
          <p className="text-xs text-warning font-medium">
            ⚠ Only send USDC to this address. Sending other tokens may result in permanent loss.
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-foreground mb-4">Quick Buy</h2>
        <QuickBuyButtons
          rate={rateNum}
          treasuryAddress={rate.treasuryAddress}
          usdcContractAddress={rate.usdcContractAddress}
        />
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-foreground mb-4">How It Works</h2>
        <div className="flex flex-col gap-4">
          {[
            { step: "1", title: "Connect Wallet", desc: "Connect your MetaMask wallet to get started." },
            { step: "2", title: "Select Amount", desc: "Choose a USDC amount and confirm the transaction." },
            { step: "3", title: "Receive BPLAY", desc: "After admin approval, BPLAY tokens are transferred to your wallet." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 items-start">
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">{step}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs text-muted text-center">
        Exchange rate: 1 USDC = {rateNum.toFixed(2)} BPLAY
      </p>
    </div>
  );
}
