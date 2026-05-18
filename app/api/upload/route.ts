import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { verifySession } from "@/lib/dal";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    await verifySession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File exceeds 10 MB limit." }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return saveToLocalFilesystem(file, req);
  }

  const { url } = await put(`attachments/${Date.now()}-${file.name}`, file, {
    access: "public",
    contentType: "application/pdf",
  });

  return NextResponse.json({ url });
}

async function saveToLocalFilesystem(file: File, req: NextRequest): Promise<NextResponse> {
  const uploadsDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${randomUUID()}.pdf`;
  const bytes = await file.arrayBuffer();
  await writeFile(join(uploadsDir, filename), Buffer.from(bytes));

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  return NextResponse.json({ url: `${origin}/uploads/${filename}` });
}
