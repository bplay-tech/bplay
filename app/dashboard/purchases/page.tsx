import { verifyRole } from "@/lib/dal";
import { getCompletedPurchases, countPurchasesByStatus } from "@/db/queries/bplay-purchases";
import { PurchasesClient } from "./PurchasesClient";

const PAGE_SIZE = 10;

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function PurchasesPage({ searchParams }: PageProps) {
  await verifyRole(["SUPER_ADMIN"]);

  const params = await searchParams;
  const activeFilter = params.status === "declined" ? "declined" : "confirmed";
  const dbStatus = activeFilter === "declined" ? "failed" : "tokens_transferred";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [{ rows, total }, confirmedTotal, declinedTotal] = await Promise.all([
    getCompletedPurchases(dbStatus, page, PAGE_SIZE),
    countPurchasesByStatus("tokens_transferred"),
    countPurchasesByStatus("failed"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">BPLAY Purchases</h1>
        <p className="text-muted mt-1">All completed token purchases</p>
      </div>
      <PurchasesClient
        purchases={rows}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        activeFilter={activeFilter}
        confirmedTotal={confirmedTotal}
        declinedTotal={declinedTotal}
      />
    </div>
  );
}
