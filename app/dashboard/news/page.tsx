import Link from "next/link";
import { Newspaper, ChevronRight } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { getSystemMessagesWithReadStatus } from "@/db/queries/system-messages";
import { LocalDate } from "@/components/ui/LocalDate";

export default async function NewsPage() {
  const user = await verifySession();
  const messages = await getSystemMessagesWithReadStatus(user.id);
  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: "rgba(124,92,255,0.2)" }}>
          <Newspaper className="h-4 w-4 text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Announcements</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-white/40 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
      </div>

      {messages.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Newspaper className="h-8 w-8 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/30">No announcements yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <Link
              key={msg.id}
              href={`/dashboard/news/${msg.id}`}
              className={`group rounded-2xl p-5 flex items-start justify-between gap-4 transition-all hover:opacity-90 ${msg.isRead ? "opacity-50" : ""}`}
              style={{
                background: "#121826",
                border: msg.isRead
                  ? "1px solid rgba(255,255,255,0.07)"
                  : "1px solid rgba(124,92,255,0.4)",
              }}
            >
              <div className="min-w-0 flex items-start gap-3">
                {!msg.isRead && (
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-purple-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className={`text-sm font-semibold group-hover:text-primary transition-colors truncate ${msg.isRead ? "text-white/50" : "text-white"}`}>
                    {msg.title}
                  </p>
                  <p className="text-xs text-white/40 mt-1 line-clamp-2">
                    {msg.body.slice(0, 140)}{msg.body.length > 140 ? "…" : ""}
                  </p>
                  <p className="text-xs text-white/25 mt-2">
                    <LocalDate iso={msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt} />
                    {" · "}{msg.authorName}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0 mt-0.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
