import { Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { LocalDate } from "@/components/ui/LocalDate";
import type { BplayPurchase } from "@/db/schema/bplay-purchases";

const formatUsdc = (value: string) =>
  Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatBplay = (value: string) =>
  Number(value).toLocaleString("en-US", { maximumFractionDigits: 6 });

export function PurchaseDocuments({
  purchases,
  profileComplete,
}: {
  purchases: BplayPurchase[];
  profileComplete: boolean;
}) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-foreground mb-1">Purchase Agreements (SAFT)</h2>
      <p className="text-muted text-sm mb-4">
        Download the Simple Agreement for Future Tokens (SAFT) for each of your token purchases.
      </p>
      {!profileComplete && purchases.length > 0 && (
        <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
          Complete all required profile fields above before you can download your SAFT documents.
        </p>
      )}
      {purchases.length === 0 ? (
        <p className="text-sm text-muted">You have no token purchases yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-card-border">
          {purchases.map((purchase) => (
            <li key={purchase.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  ${formatUsdc(purchase.usdcAmount)} USDC
                  <span className="text-muted font-normal"> · {formatBplay(purchase.bplayAmount)} BPLAY</span>
                </span>
                <span className="flex items-center gap-2 text-xs text-muted">
                  <LocalDate iso={purchase.createdAt} showTime />
                  <StatusBadge status={purchase.status} />
                </span>
              </div>
              {profileComplete ? (
                <a
                  href={`/api/purchases/${purchase.id}/saft`}
                  download
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-card-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <Download className="h-4 w-4" />
                  Download SAFT
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Complete your profile to download the SAFT"
                  className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-lg border border-card-border bg-card px-3 text-sm font-medium text-muted opacity-60"
                >
                  <Download className="h-4 w-4" />
                  Download SAFT
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
