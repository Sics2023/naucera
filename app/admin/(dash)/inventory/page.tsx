import Link from "next/link";
import { all } from "@/lib/db";
import { getSettings } from "@/lib/queries";
import { inr } from "@/lib/format";
import { Badge, Empty, Flash, PageHeader, Thumb } from "@/components/ui";
import { updateStock } from "../../actions";

export const metadata = { title: "Inventory" };

export default async function Inventory({ searchParams }: { searchParams: Promise<{ filter?: string; saved?: string }> }) {
  const { filter, saved } = await searchParams;
  const threshold = Number((await getSettings()).low_stock_threshold || 10);
  const rows = await all<{ id: number; product_id: number; title: string; name: string; sku: string; price: number; stock: number; status: string; image: string | null }>(
    `SELECT v.id, v.product_id, p.title, v.name, v.sku, v.price, v.stock, p.status,
       (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY position LIMIT 1) AS image
     FROM product_variants v JOIN products p ON p.id = v.product_id
     ${filter === "low" ? "WHERE v.stock <= ? AND p.status = 'active'" : filter === "out" ? "WHERE v.stock = 0" : ""}
     ORDER BY p.title, v.position`,
    ...(filter === "low" ? [threshold] : [])
  );
  const tabs = [["All", ""], ["Low stock", "low"], ["Out of stock", "out"]];

  return (
    <>
      <PageHeader title="Inventory" subtitle={`Update stock for every pack size in one go. Low-stock alert at ${threshold} units.`} />
      <Flash show={saved === "1"}>Stock levels updated.</Flash>
      <form action={updateStock} className="card overflow-hidden">
        <div className="flex items-center gap-1 border-b border-stone-100 px-3 pt-2">
          {tabs.map(([label, f]) => (
            <Link key={label} href={`/admin/inventory${f ? `?filter=${f}` : ""}`}
              className={`-mb-px border-b-2 px-3 py-2 text-sm ${(filter ?? "") === f ? "border-brand-700 font-medium" : "border-transparent text-stone-500 hover:text-stone-800"}`}>{label}</Link>
          ))}
          <div className="ml-auto pb-2"><button className="btn-primary">Save stock</button></div>
        </div>
        {rows.length === 0 ? <Empty title="Nothing here">No variants match this filter.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50/60"><tr><th className="th">Product</th><th className="th">SKU</th><th className="th">Price</th><th className="th">Status</th><th className="th w-36">Available</th></tr></thead>
              <tbody className="divide-y divide-stone-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50">
                    <td className="td">
                      <Link href={`/admin/products/${r.product_id}`} className="flex items-center gap-3">
                        <Thumb src={r.image} alt={r.title} size={36} />
                        <span><span className="font-medium hover:underline">{r.title}</span><span className="block text-xs text-stone-500">{r.name}</span></span>
                      </Link>
                    </td>
                    <td className="td font-mono text-xs text-stone-600">{r.sku || "—"}</td>
                    <td className="td">{inr(r.price)}</td>
                    <td className="td">{r.stock === 0 ? <Badge tone="out">Out of stock</Badge> : r.stock <= threshold ? <Badge tone="low">Low</Badge> : <Badge tone="active">In stock</Badge>}</td>
                    <td className="td"><input name={`stock_${r.id}`} type="number" min="0" defaultValue={r.stock} className="input w-28" aria-label={`Stock for ${r.title} ${r.name}`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </form>
    </>
  );
}
