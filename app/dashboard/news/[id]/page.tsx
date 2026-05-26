import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Paperclip } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { getSystemMessageById, markMessageAsRead } from "@/db/queries/system-messages";
import { RefreshOnMount } from "@/components/RefreshOnMount";
import { LocalDate } from "@/components/ui/LocalDate";
import { DeleteAnnouncementButton } from "@/app/dashboard/news/DeleteAnnouncementButton";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await verifySession();
  const message = await getSystemMessageById(id);
  if (!message) notFound();

  await markMessageAsRead(message.id, user.id);

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <RefreshOnMount />
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/news"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Announcements
        </Link>
        {user.role === "SUPER_ADMIN" && (
          <DeleteAnnouncementButton id={message.id} redirectAfter />
        )}
      </div>

      <div>
        <p className="text-xs text-muted">
          <LocalDate iso={message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt} />
          {" · "}Posted by {message.authorName}
        </p>
        <h1 className="text-2xl font-bold text-foreground mt-2">{message.title}</h1>
      </div>

      <div
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {message.body}
        </div>
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
