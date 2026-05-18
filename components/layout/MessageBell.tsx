import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { getUnreadDirectMessageCount } from "@/db/queries/direct-messages";

interface MessageBellProps {
  userId: string;
}

export async function MessageBell({ userId }: MessageBellProps) {
  let unread = 0;
  try {
    unread = await getUnreadDirectMessageCount(userId);
  } catch {
    // fail gracefully — bell still renders without badge
  }
  return (
    <Link
      href="/dashboard/messages"
      className="relative p-2 rounded-lg text-white/50 hover:text-white transition-colors"
    >
      <MessageSquare className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
