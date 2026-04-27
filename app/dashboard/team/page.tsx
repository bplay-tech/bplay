import { verifyRole } from "@/lib/dal";
import { getAllUsers, getUsersByAffiliator } from "@/db/queries/users";
import { TeamClient } from "./TeamClient";

export default async function TeamPage() {
  const user = await verifyRole(["ADMIN", "SUPER_ADMIN"]);
  const role = user.role as "ADMIN" | "SUPER_ADMIN";
  const members = role === "SUPER_ADMIN"
    ? await getAllUsers()
    : await getUsersByAffiliator(user.id);

  const subtitle = role === "SUPER_ADMIN"
    ? "All admins and their users"
    : "Users you have created";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
        <p className="text-muted mt-1">{subtitle}</p>
      </div>
      <TeamClient members={members} role={role} />
    </div>
  );
}
