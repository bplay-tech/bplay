import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserById } from "@/db/queries/users";
import { getPartnerTierById } from "@/db/queries/partner-tiers";
import { authConfig } from "./auth.config";

const ACCESS_TOKEN_TTL = 10 * 60 * 1000; // 10 minutes

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // Initial sign-in — stamp access token expiry
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          tierName: user.tierName,
          referralCode: user.referralCode,
          accessTokenExpiry: Date.now() + ACCESS_TOKEN_TTL,
        };
      }

      // Access token still valid — pass through
      if (Date.now() < (token.accessTokenExpiry as number)) {
        return token;
      }

      // Access token expired — use long-lived session (refresh token) to get fresh data
      try {
        const dbUser = await getUserById(token.id as string);
        if (!dbUser || !dbUser.isActive) {
          return { ...token, error: "RefreshFailed" as const }; // user deleted/deactivated → force logout
        }
        const tier = await getPartnerTierById(dbUser.partnerTierId);
        return {
          ...token,
          error: undefined,
          role: dbUser.role,
          tierName: tier?.name ?? "Bronze",
          referralCode: dbUser.referralCode,
          accessTokenExpiry: Date.now() + ACCESS_TOKEN_TTL,
        };
      } catch {
        return { ...token, error: "RefreshFailed" as const }; // DB unavailable → force logout
      }
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = (credentials.email as string).trim().toLowerCase();
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
