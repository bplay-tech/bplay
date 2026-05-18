import { verifyRole } from "@/lib/dal";
import { getActiveUserRecipients } from "@/db/queries/users";
import { ComposeMessageClient } from "./ComposeMessageClient";

export default async function ComposeMessagePage() {
  const actor = await verifyRole(["SUPER_ADMIN"]);
  const allUsers = await getActiveUserRecipients();
  const recipients = allUsers.filter((u) => u.id !== actor.id);

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Compose Message</h1>
        <p className="text-muted mt-1 text-sm">
          Send a direct message to a specific user. They will receive an email notification
          and see it in their Messages inbox.
        </p>
      </div>
      <ComposeMessageClient recipients={recipients} />
    </div>
  );
}
