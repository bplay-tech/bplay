import { auth } from "@/lib/auth";
import { getBplayPurchaseById } from "@/db/queries/bplay-purchases";
import { getUserById } from "@/db/queries/users";
import { generateSaftPdf, buildSaftData, buildSaftFilename } from "@/lib/saft/generate";
import { isProfileComplete } from "@/lib/profile";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.error === "RefreshFailed") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const purchase = await getBplayPurchaseById(id);
  if (!purchase || purchase.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const user = await getUserById(purchase.userId);
  if (!user) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (!isProfileComplete(user)) {
    return Response.json(
      { error: "Complete your profile before downloading the SAFT." },
      { status: 403 }
    );
  }

  const pdfBytes = await generateSaftPdf(buildSaftData(user, purchase));
  const body = new Uint8Array(pdfBytes);

  return new Response(new Blob([body], { type: "application/pdf" }), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${buildSaftFilename(purchase)}"`,
    },
  });
}
