import { verifyRole } from "@/lib/dal";
import { getAvailableBalance } from "@/db/queries/transactions";
import { getPayoutRequestsByUser, getAllPayoutRequests, getPendingPayoutByUser } from "@/db/queries/payout-requests";
import { PayoutsClient } from "./PayoutsClient";

export default async function PayoutsPage() {
  const user = await verifyRole(["ADMIN", "SUPER_ADMIN"]);
  const [balance, history, pendingAll, myPending] = await Promise.all([
    getAvailableBalance(user.id),
    getPayoutRequestsByUser(user.id),
    user.role === "SUPER_ADMIN" ? getAllPayoutRequests() : Promise.resolve(undefined),
    getPendingPayoutByUser(user.id),
  ]);

  const pending = pendingAll?.filter((r) => r.status === "pending");
  const onHold = myPending ? parseFloat(myPending.amount) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payouts</h1>
        <p className="text-muted mt-1">Request payouts and view your payout history</p>
      </div>
      <PayoutsClient
        availableBalance={balance}
        onHold={onHold}
        history={history}
        pendingAll={user.role === "SUPER_ADMIN" ? pending : undefined}
        isSuperAdmin={user.role === "SUPER_ADMIN"}
      />
    </div>
  );
}
