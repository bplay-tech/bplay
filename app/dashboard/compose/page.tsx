import { verifyRole } from "@/lib/dal";
import { getAllSystemMessages } from "@/db/queries/system-messages";
import { ComposeClient } from "./ComposeClient";

export default async function ComposePage() {
  await verifyRole(["SUPER_ADMIN"]);
  const announcements = await getAllSystemMessages();
  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Compose Announcement</h1>
        <p className="text-muted mt-1 text-sm">
          Send a broadcast message to all active users and admins. They will receive an email and
          see it in Company News.
        </p>
      </div>
      <ComposeClient announcements={announcements} />
    </div>
  );
}
