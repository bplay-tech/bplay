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
import { emailSchema } from "@/lib/zod";

export async function registerViaReferralAction(
  referralCode: string,
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const name = (formData.get("name") as string)?.trim();
  const emailResult = emailSchema.safeParse(formData.get("email"));
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!name || !emailResult.success || !password || !confirm) return { error: "All fields are required." };
  const email = emailResult.data;
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

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
