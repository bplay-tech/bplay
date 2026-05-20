import { verifyRole } from "@/lib/dal";
import { getAllUsersWithWallet, getUsersByAffiliatorWithWallet, type UserWithTierWalletAndManager } from "@/db/queries/users";
import { getAllPartnerTiers } from "@/db/queries/partner-tiers";
import { TeamClient } from "./TeamClient";

export default async function TeamPage() {
  const user = await verifyRole(["ADMIN", "SUPER_ADMIN"]);
  const role = user.role as "ADMIN" | "SUPER_ADMIN";

  const [members, tiers] = await Promise.all([
    role === "SUPER_ADMIN"
      ? getAllUsersWithWallet()
      : getUsersByAffiliatorWithWallet(user.id),
    getAllPartnerTiers(),
  ]) as [UserWithTierWalletAndManager[], Awaited<ReturnType<typeof getAllPartnerTiers>>];

  const subtitle = role === "SUPER_ADMIN"
    ? "All admins and their users"
    : "Users you have created";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
        <p className="text-muted mt-1">{subtitle}</p>
      </div>
      <TeamClient members={members} tiers={tiers} role={role} />
    </div>
  );
}
