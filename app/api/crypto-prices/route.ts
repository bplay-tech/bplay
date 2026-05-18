import { NextResponse } from "next/server";
import { fetchTopCryptos } from "@/lib/coingecko";

export async function GET() {
  const data = await fetchTopCryptos();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
    },
  });
}
