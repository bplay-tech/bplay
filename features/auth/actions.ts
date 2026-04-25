"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserById, updateUser } from "@/db/queries/users";
import { signResetToken, verifyResetToken } from "@/lib/reset-token";
import { sendPasswordResetEmail } from "@/lib/email";

export async function loginAction(
  _prev: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard/overview" });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }
  return { error: "" };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function forgotPasswordAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Email is required." };

  // Always return success to avoid revealing whether an account exists
  const user = await getUserByEmail(email);
  if (!user || !user.isActive) return { success: true };

  const token = await signResetToken(user.id, user.email);
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(user.email, user.name, resetUrl);
  } catch {
    return { error: "Failed to send reset email. Please try again." };
  }

  return { success: true };
}

export async function resetPasswordAction(
  token: string,
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!password || password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const payload = await verifyResetToken(token);
  if (!payload) return { error: "This reset link has expired or is invalid." };

  const user = await getUserById(payload.userId);
  if (!user || user.email !== payload.email) return { error: "Reset link is no longer valid." };

  const passwordHash = await bcrypt.hash(password, 12);
  await updateUser(payload.userId, { passwordHash });

  redirect("/login?reset=1");
}
