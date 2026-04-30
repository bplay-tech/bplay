import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { getSystemMessageById, markMessageAsRead } from "@/db/queries/system-messages";

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
    <div className="flex flex-col gap-6 max-w-3xl">
      <Link
        href="/dashboard/news"
        className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Announcements
      </Link>

      <div>
        <p className="text-xs text-muted">
          {new Date(message.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {" · "}Posted by {message.authorName}
        </p>
        <h1 className="text-2xl font-bold text-foreground mt-2">{message.title}</h1>
      </div>

      <div
        className="rounded-2xl p-6 text-sm text-foreground leading-relaxed whitespace-pre-wrap"
        style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {message.body}
      </div>
    </div>
  );
}
