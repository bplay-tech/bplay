"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserByReferralCode, createUser } from "@/db/queries/users";
import { createAffiliation } from "@/db/queries/affiliations";
import { getPartnerTierByName } from "@/db/queries/partner-tiers";
import { upsertSettings } from "@/db/queries/user-settings";
import { upsertNotifications } from "@/db/queries/user-notifications";
import { generateUniqueReferralCode } from "@/lib/referral";
import { sendWelcomeEmail } from "@/lib/email";
import { registrationSchema } from "@/lib/zod";

export async function registerViaReferralAction(
  referralCode: string,
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const confirm = formData.get("confirm") as string;
  const parsed = registrationSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    dateOfBirth: formData.get("dateOfBirth"),
    country: formData.get("country"),
    address: formData.get("address"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please fill in all required fields." };
  }
  const { firstName, lastName, email, phone, dateOfBirth, country, address, password } = parsed.data;
  if (password !== confirm) return { error: "Passwords do not match." };

  const name = `${firstName} ${lastName}`;

  const referrer = await getUserByReferralCode(referralCode);
  if (!referrer) return { error: "Invalid referral link." };

  const existing = await getUserByEmail(email);
  if (existing) return { error: "An account with this email already exists." };

  const bronzeTier = await getPartnerTierByName("Bronze");
  if (!bronzeTier) return { error: "System configuration error. Please try again later." };

  const newReferralCode = await generateUniqueReferralCode(name);
  const passwordHash = await bcrypt.hash(password, 12);

  const newUser = await createUser({
    email,
    passwordHash,
    name,
    firstName,
    lastName,
    phone,
    dateOfBirth,
    country,
    address,
    role: "USER",
    partnerTierId: bronzeTier.id,
    referralCode: newReferralCode,
    isActive: true,
  });

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/buy`;

  await Promise.all([
    createAffiliation({ affiliateId: referrer.id, referredUserId: newUser.id }),
    upsertSettings(newUser.id, {}),
    upsertNotifications(newUser.id, {}),
    sendWelcomeEmail(email, name, referrer.name, dashboardUrl),
  ]);

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard/buy" });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }

  return null;
}
