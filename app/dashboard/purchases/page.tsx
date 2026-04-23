import { verifyRole } from "@/lib/dal";
import { getAllPendingPurchases } from "@/db/queries/bplay-purchases";
import { PurchasesClient } from "./PurchasesClient";

export default async function PurchasesPage() {
  await verifyRole(["SUPER_ADMIN"]);
  const purchases = await getAllPendingPurchases();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">BPLAY Purchases</h1>
        <p className="text-muted mt-1">Review and approve pending token purchase requests</p>
      </div>
      <PurchasesClient purchases={purchases} />
    </div>
  );
}
