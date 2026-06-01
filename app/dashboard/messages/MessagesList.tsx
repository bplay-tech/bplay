"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, MessageSquare, Search, Send } from "lucide-react";
import { LocalDate } from "@/components/ui/LocalDate";
import { DeleteMessageButton } from "./[id]/DeleteMessageButton";
import type {
  DirectMessageWithSender,
  DirectMessageWithRecipient,
} from "@/db/queries/direct-messages";

interface MessagesListProps {
  inbox: DirectMessageWithSender[];
  sent: DirectMessageWithRecipient[];
  showSent: boolean;
}

const matches = (haystack: string | null | undefined, needle: string) =>
  (haystack ?? "").toLowerCase().includes(needle);

const toIso = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : value;

export function MessagesList({ inbox, sent, showSent }: MessagesListProps) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filteredInbox = useMemo(() => {
    if (!q) return inbox;
    return inbox.filter(
      (m) => matches(m.subject, q) || matches(m.body, q) || matches(m.senderName, q)
    );
  }, [inbox, q]);

  const filteredSent = useMemo(() => {
    if (!q) return sent;
    return sent.filter(
      (m) => matches(m.subject, q) || matches(m.body, q) || matches(m.recipientName, q)
    );
  }, [sent, q]);

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search messages by subject, body or person…"
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-card border border-card-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
          Inbox{q && ` · ${filteredInbox.length} of ${inbox.length}`}
        </h2>
        {filteredInbox.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-8 w-8 text-white/20" />}
            text={q ? "No messages match your search." : "No messages yet."}
          />
        ) : (
          filteredInbox.map((msg) => (
            <div key={msg.id} className="flex items-center gap-2">
              <Link
                href={`/dashboard/messages/${msg.id}`}
                className={`group flex-1 rounded-2xl p-5 flex items-start justify-between gap-4 transition-all hover:opacity-90 ${msg.isRead ? "opacity-50" : ""}`}
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
                      <LocalDate iso={toIso(msg.createdAt)} showTime />
                      {" · "}{msg.senderName}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0 mt-0.5" />
              </Link>
              <DeleteMessageButton messageId={msg.id} />
            </div>
          ))
        )}
      </section>

      {showSent && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
            <Send className="h-3 w-3" /> Sent{q && ` · ${filteredSent.length} of ${sent.length}`}
          </h2>
          {filteredSent.length === 0 ? (
            <EmptyState
              icon={<Send className="h-8 w-8 text-white/20" />}
              text={q ? "No sent messages match your search." : "No sent messages."}
            />
          ) : (
            filteredSent.map((msg) => (
              <div key={msg.id} className="flex items-center gap-2">
                <div
                  className="flex-1 rounded-2xl p-5"
                  style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <p className="text-sm font-semibold text-white/70 truncate">{msg.subject}</p>
                  <p className="text-xs text-white/40 mt-1 line-clamp-2">
                    {msg.body.slice(0, 120)}{msg.body.length > 120 ? "…" : ""}
                  </p>
                  <p className="text-xs text-white/25 mt-2">
                    <LocalDate iso={toIso(msg.createdAt)} showTime />
                    {" · To: "}{msg.recipientName}
                    {msg.isRead ? " · Read" : " · Unread"}
                  </p>
                </div>
                <DeleteMessageButton messageId={msg.id} />
              </div>
            ))
          )}
        </section>
      )}
    </>
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
