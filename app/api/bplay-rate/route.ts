import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentExchangeRate } from "@/db/queries/exchange-rates";

export const dynamic = "force-dynamic";

export async function GET() {
  noStore();
  const rate = await getCurrentExchangeRate();
  const ratePerUsdc = rate ? parseFloat(rate.rate) : 0;
  return NextResponse.json({ ratePerUsdc });
}
