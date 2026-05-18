import { verifyRole } from "@/lib/dal";
import { getCurrentExchangeRate } from "@/db/queries/exchange-rates";
import { Card } from "@/components/ui/Card";
import { ExchangeRateForm } from "./ExchangeRateForm";
import { LocalDate } from "@/components/ui/LocalDate";

export default async function ExchangeRatePage() {
  await verifyRole(["SUPER_ADMIN"]);
  const current = await getCurrentExchangeRate();

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Exchange Rate</h1>
        <p className="text-muted mt-1">Manage the USDC → BPLAY conversion rate</p>
      </div>

      {current && (
        <Card className="border-primary/30 bg-primary/5">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Current Rate</p>
          <p className="text-3xl font-bold text-foreground">
            1 USDC = {parseFloat(current.rate).toFixed(4)} BPLAY
          </p>
          <p className="text-xs text-muted mt-2">
            Last updated: <LocalDate iso={current.updatedAt instanceof Date ? current.updatedAt.toISOString() : current.updatedAt} showTime />
          </p>
        </Card>
      )}

      <ExchangeRateForm current={current} />
    </div>
  );
}
