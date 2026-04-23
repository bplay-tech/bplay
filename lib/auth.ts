import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/db/queries/users";
import { getPartnerTierById } from "@/db/queries/partner-tiers";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        const password = credentials.password as string;

        const dbUser = await getUserByEmail(email);
        if (!dbUser || !dbUser.isActive) return null;

        const valid = await bcrypt.compare(password, dbUser.passwordHash);
        if (!valid) return null;

        const tier = await getPartnerTierById(dbUser.partnerTierId);

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          tierName: tier?.name ?? "Bronze",
          referralCode: dbUser.referralCode,
        };
      },
    }),
  ],
});
