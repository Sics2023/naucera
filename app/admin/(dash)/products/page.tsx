import Link from "next/link";
import { listCategories, listProducts } from "@/lib/queries";
import { inr } from "@/lib/format";
import { Badge, Empty, Flash, PageHeader, Thumb } from "@/components/ui";
import { Download, Plus, Search, Star } from "lucide-react";

export const metadata = { title: "Products" };

type SP = Promise<{ q?: string; category?: string; status?: string; stock?: string; deleted?: string }>;

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [products, categories] = await Promise.all([listProducts(sp), listCategories()]);
  const tabs = [
    { label: "All", status: "" },
    { label: "Active", status: "active" },
    { label: "Draft", status: "draft" },
    { label: "Archived", status: "archived" },
  ];

  return (
    <>
      <PageHeader title="Products" subtitle={`${products.length} product${products.length === 1 ? "" : "s"}`}>
        <a href="/api/admin/export" className="btn-secondary"><Download size={16} /> Export CSV</a>
        <Link href="/admin/products/new" className="btn-primary"><Plus size={16} /> Add product</Link>
      </PageHeader>
      <Flash show={sp.deleted === "1"}>Product deleted.</Flash>

      <div className="card overflow-hidden">
        <div className="flex gap-1 border-b border-stone-100 px-3 pt-2">
          {tabs.map((t) => {
            const active = (sp.status ?? "") === t.status;
            const qs = new URLSearchParams({ ...(sp.q && { q: sp.q }), ...(sp.category && { category: sp.category }), ...(t.status && { status: t.status }) });
            return (
              <Link key={t.label} href={`/admin/products?${qs}`}
                className={`-mb-px border-b-2 px-3 py-2 text-sm ${active ? "border-brand-700 font-medium text-stone-900" : "border-transparent text-stone-500 hover:text-stone-800"}`}>
                {t.label}
              </Link>
            );
          })}
        </div>
        <form className="flex flex-wrap gap-2 border-b border-stone-100 p-3">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <div className="relative min-w-56 flex-1">
            <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-stone-400" />
            <input name="q" defaultValue={sp.q} placeholder="Search by name, tag or SKU" className="input pl-9" />
          </div>
          <select name="category" defaultValue={sp.category ?? ""} className="input w-auto">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select name="stock" defaultValue={sp.stock ?? ""} className="input w-auto">
            <option value="">Any stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          <button className="btn-secondary">Filter</button>
        </form>

        {products.length === 0 ? (
          <Empty title="No products found">
            Try a different search, or <Link href="/admin/products/new" className="text-brand-700 underline">add a product</Link>.
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50/60"><tr><th className="th">Product</th><th className="th">Status</th><th className="th">Inventory</th><th className="th">Category</th><th className="th text-right">Price</th></tr></thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="td">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                        <Thumb src={p.image} alt={p.title} />
                        <span className="font-medium text-stone-900 hover:underline">{p.title}</span>
                        {p.featured ? <Star size={14} className="fill-amber-400 text-amber-400" aria-label="Featured" /> : null}
                      </Link>
                    </td>
                    <td className="td"><Badge tone={p.status} /></td>
                    <td className="td whitespace-nowrap">
                      {p.total_stock <= 0 ? <span className="text-red-700">Out of stock</span> : <span>{p.total_stock} in stock</span>}
                      <span className="text-stone-500"> · {p.variant_count} variant{p.variant_count === 1 ? "" : "s"}</span>
                    </td>
                    <td className="td text-stone-600">{p.category_name ?? "—"}</td>
                    <td className="td text-right whitespace-nowrap">
                      {!p.max_price ? <span className="text-red-700">Price not set</span> : p.min_price === p.max_price ? inr(p.min_price) : `${inr(p.min_price)} – ${inr(p.max_price)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
