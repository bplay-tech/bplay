import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Paperclip } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { getDirectMessageById, markDirectMessageRead } from "@/db/queries/direct-messages";
import { LocalDate } from "@/components/ui/LocalDate";
import { DeleteMessageButton } from "./DeleteMessageButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MessageDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await verifySession();

  const message = await getDirectMessageById(id);
  if (!message) notFound();

  // Only the recipient can view it
  if (message.toUserId !== user.id && user.role !== "SUPER_ADMIN") notFound();

  // Mark as read if the current user is the recipient
  if (message.toUserId === user.id && !message.isRead) {
    await markDirectMessageRead(id, user.id);
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/messages"
          className="p-2 rounded-lg text-white/40 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-foreground truncate">{message.subject}</h1>
      </div>

      <div
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Meta */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <p className="text-sm font-semibold text-white">{message.subject}</p>
            <p className="text-xs text-white/40 mt-1">
              From: <span className="text-white/60">{message.senderName}</span>
              {" · "}
              <LocalDate
                iso={message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt}
                showTime
              />
            </p>
          </div>
          <DeleteMessageButton messageId={message.id} redirectAfter />
        </div>

        {/* Body */}
        <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
          {message.body}
        </div>

        {/* Attachment */}
        {message.attachmentUrl && (
          <div className="pt-3 border-t border-white/10">
            <a
              href={message.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-blue-300 transition-colors hover:text-blue-200"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)" }}
            >
              <Paperclip className="h-4 w-4" />
              {message.attachmentName ?? "Attachment"}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
