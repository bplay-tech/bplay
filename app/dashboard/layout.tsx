import { verifySession } from "@/lib/dal";
import { TopNav } from "@/components/layout/TopNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await verifySession();

  return (
    <div className="min-h-screen bg-bg">
      <TopNav name={user.name ?? ""} role={user.role} tierName={user.tierName} />
      <main className="px-6 py-6 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
