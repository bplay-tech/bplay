import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse, type NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

const ADMIN_ROUTES = ["/dashboard/team"];
const SUPER_ADMIN_ROUTES = ["/dashboard/purchases", "/dashboard/exchange-rate"];

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (!pathname.startsWith("/dashboard")) return NextResponse.next();

  const session = await auth();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const role = session.user.role as string;

  if (SUPER_ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard/overview", req.nextUrl));
  }

  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard/overview", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
