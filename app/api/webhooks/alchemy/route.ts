import { type NextRequest } from "next/server";
import { createHmac } from "crypto";
import { getPurchaseByTxHash, autoApprovePurchase } from "@/db/queries/bplay-purchases";

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-alchemy-signature") ?? "";
  const secret = process.env.ALCHEMY_WEBHOOK_SECRET ?? "";

  if (!verifySignature(body, signature, secret)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { event?: { activity?: { hash?: string }[] } };
  try {
    payload = JSON.parse(body);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const txHash = payload.event?.activity?.[0]?.hash;
  if (!txHash) return Response.json({ ok: true });

  const existing = await getPurchaseByTxHash(txHash);
  if (!existing) {
    return Response.json({ ok: true, unknown: true });
  }

  if (existing.status === "pending_payment") {
    await autoApprovePurchase(txHash);
  }

  return Response.json({ ok: true });
}
