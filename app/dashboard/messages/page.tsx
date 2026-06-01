import Link from "next/link";
import { MessageSquare, PenSquare } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { getInboxForUser, getSentByUser } from "@/db/queries/direct-messages";
import { MessagesList } from "./MessagesList";

export default async function MessagesPage() {
  const user = await verifySession();
  const [inbox, sent] = await Promise.all([
    getInboxForUser(user.id),
    user.role === "SUPER_ADMIN" ? getSentByUser(user.id) : Promise.resolve([]),
  ]);

  const unreadCount = inbox.filter((m) => !m.isRead).length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(59,130,246,0.2)" }}
          >
            <MessageSquare className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Messages</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-white/40 mt-0.5">{unreadCount} unread</p>
            )}
          </div>
        </div>
        {user.role === "SUPER_ADMIN" && (
          <Link
            href="/dashboard/messages/compose"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: "rgba(124,92,255,0.2)", border: "1px solid rgba(124,92,255,0.4)" }}
          >
            <PenSquare className="h-4 w-4" />
            Compose
          </Link>
        )}
      </div>

      <MessagesList inbox={inbox} sent={sent} showSent={user.role === "SUPER_ADMIN"} />
    </div>
  );
}
