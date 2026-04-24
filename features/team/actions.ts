"use server";

import { revalidatePath } from "next/cache";
import { verifyRole } from "@/lib/dal";
import { createUser, updateUser } from "@/db/queries/users";
import { createAffiliation } from "@/db/queries/affiliations";
import { getPartnerTierByName } from "@/db/queries/partner-tiers";
import { upsertSettings } from "@/db/queries/user-settings";
import { upsertNotifications } from "@/db/queries/user-notifications";
import { createInvitationToken } from "@/db/queries/invitation-tokens";
import { generateUniqueReferralCode } from "@/lib/referral";
import { sendInvitationEmail } from "@/lib/email";
import { walletAddressSchema } from "@/lib/zod";

export async function createUserAction(
  _prev: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const actor = await verifyRole(["SUPER_ADMIN"]);
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const role = formData.get("role") as "SELLER" | "ADMIN";

  if (!name || !email || !role) return { error: "All fields are required." };

  const bronzeTier = await getPartnerTierByName("Bronze");
  if (!bronzeTier) return { error: "Bronze tier not found. Run db:seed first." };

  const referralCode = await generateUniqueReferralCode(name);

  const newUser = await createUser({
    email,
    passwordHash: "",
    name,
    role,
    partnerTierId: bronzeTier.id,
    referralCode,
    isActive: false,
  });

  await Promise.all([
    createAffiliation({ affiliateId: actor.id, referredUserId: newUser.id }),
    upsertSettings(newUser.id, {}),
    upsertNotifications(newUser.id, {}),
  ]);

  const token = await createInvitationToken(newUser.id);
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${token}`;
  await sendInvitationEmail(email, name, inviteUrl);

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

export async function updateTransferAddressAction(
  userId: string,
  address: string
): Promise<{ error: string } | { success: true }> {
  await verifyRole(["ADMIN", "SUPER_ADMIN"]);

  const trimmed = address.trim();
  if (trimmed !== "") {
    const result = walletAddressSchema.safeParse(trimmed);
    if (!result.success) return { error: "Invalid Ethereum address." };
  }

  await updateUser(userId, { transferAddress: trimmed || null });
  revalidatePath("/dashboard/team");
  return { success: true };
}
