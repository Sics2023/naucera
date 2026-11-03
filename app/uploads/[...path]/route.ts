import { get } from "@/lib/db";

/** Serves images stored in the `media` table: /uploads/<id>/<filename> */
export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const [idPart] = (await params).path;
  const id = Number(idPart);
  if (!Number.isInteger(id) || id <= 0) return new Response("Not found", { status: 404 });
  const row = await get<{ mime: string; data: Buffer }>("SELECT mime, data FROM media WHERE id = ?", id);
  if (!row) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
