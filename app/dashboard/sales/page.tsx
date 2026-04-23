import { SalesTable } from "./SalesTable";

export default function SalesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sales & Referrals</h1>
        <p className="text-muted mt-1">Track your transactions and filter by date, type, or status</p>
      </div>
      <SalesTable />
    </div>
  );
}
