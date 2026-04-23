"use server";

import { revalidatePath } from "next/cache";
import { verifyRole } from "@/lib/dal";
import { createUser, updateUser } from "@/db/queries/users";
import { createAffiliation } from "@/db/queries/affiliations";
import { getPartnerTierByName } from "@/db/queries/partner-tiers";
import { upsertSettings } from "@/db/queries/user-settings";
import { upsertNotifications } from "@/db/queries/user-notifications";
import { generateUniqueReferralCode } from "@/lib/referral";
import bcrypt from "bcryptjs";

export async function createUserAction(
  _prev: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const actor = await verifyRole(["SUPER_ADMIN"]);
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const role = formData.get("role") as "SELLER" | "ADMIN";

  if (!name || !email || !password || !role) return { error: "All fields are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const bronzeTier = await getPartnerTierByName("Bronze");
  if (!bronzeTier) return { error: "Bronze tier not found. Run db:seed first." };

  const passwordHash = await bcrypt.hash(password, 12);
  const referralCode = await generateUniqueReferralCode(name);

  const newUser = await createUser({ email, passwordHash, name, role, partnerTierId: bronzeTier.id, referralCode });

  await Promise.all([
    createAffiliation({ affiliateId: actor.id, referredUserId: newUser.id }),
    upsertSettings(newUser.id, {}),
    upsertNotifications(newUser.id, {}),
  ]);

  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function deactivateUserAction(userId: string): Promise<void> {
  await verifyRole(["SUPER_ADMIN"]);
  await updateUser(userId, { isActive: false });
  revalidatePath("/dashboard/team");
}

export async function updateUserTierAction(userId: string, tierName: string): Promise<void> {
  await verifyRole(["SUPER_ADMIN"]);
  const tier = await getPartnerTierByName(tierName);
  if (!tier) return;
  await updateUser(userId, { partnerTierId: tier.id });
  revalidatePath("/dashboard/team");
}
