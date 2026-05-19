"use server";

import { revalidatePath } from "next/cache";
import { verifyRole } from "@/lib/dal";
import { createUser, updateUser, deleteUser } from "@/db/queries/users";
import { createAffiliation, getAffiliationByReferredUser } from "@/db/queries/affiliations";
import { getPartnerTierByName } from "@/db/queries/partner-tiers";
import { getBplayBalance } from "@/db/queries/bplay-purchases";
import { upsertSettings } from "@/db/queries/user-settings";
import { upsertNotifications } from "@/db/queries/user-notifications";
import { generateUniqueReferralCode } from "@/lib/referral";
import { signInviteToken } from "@/lib/invite-token";
import { sendInvitationEmail } from "@/lib/email";
import { emailSchema, walletAddressSchema } from "@/lib/zod";

export async function createUserAction(
  _prev: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const actor = await verifyRole(["ADMIN", "SUPER_ADMIN"]);
  const name = (formData.get("name") as string)?.trim();
  const emailResult = emailSchema.safeParse(formData.get("email"));
  const role = formData.get("role") as "USER" | "SALES" | "ADMIN";

  if (!name || !emailResult.success || !role) return { error: "All fields are required." };
  const email = emailResult.data;
  if (actor.role === "ADMIN" && role !== "USER" && role !== "SALES")
    return { error: "Admins can only create User or Sales accounts." };

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

  const token = await signInviteToken(newUser.id, name);
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${token}`;
  try {
    await sendInvitationEmail(email, name, inviteUrl, actor.name ?? "BPLAY");
  } catch (err) {
    return { error: `User created but invitation email failed: ${(err as Error).message}` };
  }

  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function deleteUserAction(userId: string): Promise<void> {
  await verifyRole(["SUPER_ADMIN"]);
  await deleteUser(userId);
  revalidatePath("/dashboard/team");
}

export async function updateUserTierAction(userId: string, tierName: string): Promise<void> {
  await verifyRole(["SUPER_ADMIN"]);
  const tier = await getPartnerTierByName(tierName);
  if (!tier) return;
  await updateUser(userId, { partnerTierId: tier.id });
  revalidatePath("/dashboard/team");
}

export async function updateUserRoleAction(
  userId: string,
  role: "USER" | "SALES" | "ADMIN"
): Promise<{ error: string } | { success: true }> {
  const actor = await verifyRole(["ADMIN", "SUPER_ADMIN"]);

  if (actor.role === "ADMIN") {
    if (role === "ADMIN") return { error: "Admins cannot assign the Admin role." };
    const affiliation = await getAffiliationByReferredUser(userId);
    if (!affiliation || affiliation.affiliateId !== actor.id)
      return { error: "You can only manage users you referred." };
  }

  if (role === "SALES") {
    const [balance, silverTier, bronzeTier] = await Promise.all([
      getBplayBalance(userId),
      getPartnerTierByName("Silver"),
      getPartnerTierByName("Bronze"),
    ]);
    const tier = balance >= 50_000 ? silverTier : bronzeTier;
    if (!tier) return { error: "Required tier not found. Run db:seed first." };
    await updateUser(userId, { role, partnerTierId: tier.id });
  } else {
    await updateUser(userId, { role });
  }

  revalidatePath("/dashboard/team");
  return { success: true };
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
