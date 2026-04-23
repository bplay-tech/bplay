import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tierName = user.tierName;
        token.referralCode = user.referralCode;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as "SELLER" | "ADMIN" | "SUPER_ADMIN";
      session.user.tierName = token.tierName as string;
      session.user.referralCode = token.referralCode as string;
      return session;
    },
  },
  providers: [],
};
