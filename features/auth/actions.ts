"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

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
