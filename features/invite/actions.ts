"use server";

import { redirect } from "next/navigation";
import { getValidInvitationToken, markTokenUsed } from "@/db/queries/invitation-tokens";
import { updateUser } from "@/db/queries/users";
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

  const record = await getValidInvitationToken(token);
  if (!record) return { error: "This link has expired or has already been used." };

  const passwordHash = await bcrypt.hash(password, 12);
  await updateUser(record.userId, { passwordHash, isActive: true });
  await markTokenUsed(record.id);

  redirect("/login");
}
