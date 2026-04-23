import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const ADMIN_ROUTES = ["/dashboard/team"];
const SUPER_ADMIN_ROUTES = ["/dashboard/purchases", "/dashboard/exchange-rate"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  if (!pathname.startsWith("/dashboard")) return NextResponse.next();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  const role = session.user.role;

  if (SUPER_ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/overview", nextUrl));
    }
  }

  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/overview", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
