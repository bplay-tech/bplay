"use server";

import { redirect } from "next/navigation";
import { verifyInviteToken } from "@/lib/invite-token";
import { updateUser, getUserById } from "@/db/queries/users";
import bcrypt from "bcryptjs";

export async function setPasswordAction(
  token: string,
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!password || password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const payload = await verifyInviteToken(token);
  if (!payload) return { error: "This link has expired or is invalid." };

  const user = await getUserById(payload.userId);
  if (!user) return { error: "Account not found." };
  if (user.isActive) return { error: "This account is already activated. Please log in." };

  const passwordHash = await bcrypt.hash(password, 12);
  await updateUser(payload.userId, { passwordHash, isActive: true });

  redirect("/login");
}
