import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    error?: "RefreshFailed";
    user: {
      id: string;
      role: "USER" | "ADMIN" | "SUPER_ADMIN";
      tierName: string;
      referralCode: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "USER" | "ADMIN" | "SUPER_ADMIN";
    tierName: string;
    referralCode: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN" | "SUPER_ADMIN";
    tierName: string;
    referralCode: string;
    accessTokenExpiry: number;
    error?: "RefreshFailed";
  }
}
