import { NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/auth";
import { UPLOAD_DIR, db } from "@/lib/db";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const MAX = 8 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  db(); // make sure the data directory exists
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No files received" }, { status: 400 });
  const urls: string[] = [];
  for (const f of files) {
    const ext = TYPES[f.type];
    if (!ext) return NextResponse.json({ error: `${f.name}: only JPG, PNG, WebP, GIF or AVIF images are allowed` }, { status: 400 });
    if (f.size > MAX) return NextResponse.json({ error: `${f.name}: image must be under 8 MB` }, { status: 400 });
    const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await f.arrayBuffer()));
    urls.push(`/uploads/${name}`);
  }
  return NextResponse.json({ urls });
}
