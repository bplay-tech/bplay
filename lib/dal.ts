"use server";

import { redirect } from "next/navigation";
import { auth } from "./auth";

type Role = "SELLER" | "ADMIN" | "SUPER_ADMIN";

export const verifySession = async () => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
};

export const verifyRole = async (allowed: Role[]) => {
  const user = await verifySession();
  if (!allowed.includes(user.role as Role)) redirect("/dashboard/overview");
  return user;
};
