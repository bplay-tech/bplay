import Link from "next/link";
import { Bell } from "lucide-react";
import { getUnreadMessageCount } from "@/db/queries/system-messages";

interface NotificationBellProps {
  userId: string;
}

export async function NotificationBell({ userId }: NotificationBellProps) {
  let unread = 0;
  try {
    unread = await getUnreadMessageCount(userId);
  } catch {
    // fail gracefully — bell still renders without badge
  }
  return (
    <Link
      href="/dashboard/news"
      className="relative p-2 rounded-lg text-white/50 hover:text-white transition-colors"
    >
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
