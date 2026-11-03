import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { run } from "@/lib/db";

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
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No files received" }, { status: 400 });
  for (const f of files) {
    if (!TYPES[f.type]) return NextResponse.json({ error: `${f.name}: only JPG, PNG, WebP, GIF or AVIF images are allowed` }, { status: 400 });
    if (f.size > MAX) return NextResponse.json({ error: `${f.name}: image must be under 8 MB` }, { status: 400 });
  }
  const urls: string[] = [];
  try {
    for (const f of files) {
      const base = f.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || "image";
      const filename = `${base}.${TYPES[f.type]}`;
      const data = Buffer.from(await f.arrayBuffer());
      const { insertId } = await run("INSERT INTO media (filename, mime, size, data) VALUES (?, ?, ?, ?)", filename, f.type, data.length, data);
      urls.push(`/uploads/${insertId}/${filename}`);
    }
  } catch (e) {
    console.error("Upload failed", e);
    const tooBig = e instanceof Error && /max_allowed_packet|too large/i.test(e.message);
    return NextResponse.json({ error: tooBig ? "Image is too large for the database. Please use a smaller image (under 4 MB)." : "Upload failed. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ urls });
}
