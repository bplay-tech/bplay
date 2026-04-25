import { verifyRole } from "@/lib/dal";
import { getAllUsers, getUsersByAffiliator } from "@/db/queries/users";
import { TeamClient } from "./TeamClient";

export default async function TeamPage() {
  const user = await verifyRole(["ADMIN", "SUPER_ADMIN"]);
  const members = user.role === "SUPER_ADMIN"
    ? await getAllUsers()
    : await getUsersByAffiliator(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
        <p className="text-muted mt-1">
          {user.role === "SUPER_ADMIN" ? "All partners in the system" : "Partners you referred"}
        </p>
      </div>
      <TeamClient members={members} isSuperAdmin={user.role === "SUPER_ADMIN"} />
    </div>
  );
}
