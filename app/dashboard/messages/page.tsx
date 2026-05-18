import Link from "next/link";
import { MessageSquare, ChevronRight, Send, PenSquare } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { getInboxForUser, getSentByUser } from "@/db/queries/direct-messages";
import { LocalDate } from "@/components/ui/LocalDate";

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

      {/* Inbox */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Inbox</h2>
        {inbox.length === 0 ? (
          <EmptyState icon={<MessageSquare className="h-8 w-8 text-white/20" />} text="No messages yet." />
        ) : (
          inbox.map((msg) => (
            <Link
              key={msg.id}
              href={`/dashboard/messages/${msg.id}`}
              className={`group rounded-2xl p-5 flex items-start justify-between gap-4 transition-all hover:opacity-90 ${msg.isRead ? "opacity-50" : ""}`}
              style={{
                background: "#121826",
                border: msg.isRead
                  ? "1px solid rgba(255,255,255,0.07)"
                  : "1px solid rgba(59,130,246,0.4)",
              }}
            >
              <div className="min-w-0 flex items-start gap-3">
                {!msg.isRead && (
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className={`text-sm font-semibold group-hover:text-primary transition-colors truncate ${msg.isRead ? "text-white/50" : "text-white"}`}>
                    {msg.subject}
                  </p>
                  <p className="text-xs text-white/40 mt-1 line-clamp-2">
                    {msg.body.slice(0, 120)}{msg.body.length > 120 ? "…" : ""}
                  </p>
                  <p className="text-xs text-white/25 mt-2">
                    <LocalDate iso={msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt} showTime />
                    {" · "}{msg.senderName}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0 mt-0.5" />
            </Link>
          ))
        )}
      </section>

      {/* Sent — SUPER_ADMIN only */}
      {user.role === "SUPER_ADMIN" && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
            <Send className="h-3 w-3" /> Sent
          </h2>
          {sent.length === 0 ? (
            <EmptyState icon={<Send className="h-8 w-8 text-white/20" />} text="No sent messages." />
          ) : (
            sent.map((msg) => (
              <div
                key={msg.id}
                className="rounded-2xl p-5"
                style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-sm font-semibold text-white/70 truncate">{msg.subject}</p>
                <p className="text-xs text-white/40 mt-1 line-clamp-2">
                  {msg.body.slice(0, 120)}{msg.body.length > 120 ? "…" : ""}
                </p>
                <p className="text-xs text-white/25 mt-2">
                  <LocalDate iso={msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt} showTime />
                  {" · To: "}{msg.recipientName}
                  {msg.isRead ? " · Read" : " · Unread"}
                </p>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div
      className="rounded-2xl p-10 text-center"
      style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="text-sm text-white/30">{text}</p>
    </div>
  );
}
