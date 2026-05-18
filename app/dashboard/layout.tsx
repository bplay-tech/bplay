import { verifySession } from "@/lib/dal";
import { TopNav } from "@/components/layout/TopNav";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { MessageBell } from "@/components/layout/MessageBell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await verifySession();

  return (
    <div className="min-h-screen bg-bg">
      <TopNav
        name={user.name ?? ""}
        role={user.role}
        tierName={user.tierName}
        notificationBell={
          <>
            <MessageBell userId={user.id} />
            <NotificationBell userId={user.id} />
          </>
        }
      />
      <main className="px-4 py-4 sm:px-6 sm:py-6 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
