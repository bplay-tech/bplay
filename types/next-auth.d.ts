import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "SELLER" | "ADMIN" | "SUPER_ADMIN";
      tierName: string;
      referralCode: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "SELLER" | "ADMIN" | "SUPER_ADMIN";
    tierName: string;
    referralCode: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "SELLER" | "ADMIN" | "SUPER_ADMIN";
    tierName: string;
    referralCode: string;
  }
}
