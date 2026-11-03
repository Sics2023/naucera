import { getSession } from "@/lib/auth";
import { all } from "@/lib/db";

const esc = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  if (!(await getSession())) return new Response("Not signed in", { status: 401 });
  const rows = await all<Record<string, unknown>>(
    `SELECT p.id, p.title, p.slug, p.status, c.name AS category, p.tags, v.name AS variant, v.sku, v.price, v.compare_at_price, v.stock, v.weight_grams
     FROM products p LEFT JOIN categories c ON c.id = p.category_id LEFT JOIN product_variants v ON v.product_id = p.id
     ORDER BY p.id, v.position`
  );
  const cols = ["id", "title", "slug", "status", "category", "tags", "variant", "sku", "price", "compare_at_price", "stock", "weight_grams"];
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="naucera-products-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
