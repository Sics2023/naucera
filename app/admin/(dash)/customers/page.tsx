import Link from "next/link";
import { all } from "@/lib/db";
import { inr, fmtDate } from "@/lib/format";
import { Empty, PageHeader } from "@/components/ui";
import { Search } from "lucide-react";

export const metadata = { title: "Customers" };

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const rows = await all<{ id: number; name: string; email: string; phone: string; city: string; state: string; created_at: string; orders: number; spent: number; last: string | null }>(
    `SELECT c.*,
       (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS orders,
       (SELECT COALESCE(SUM(o.total),0) FROM orders o WHERE o.customer_id = c.id AND o.status != 'cancelled') AS spent,
       (SELECT MAX(o.created_at) FROM orders o WHERE o.customer_id = c.id) AS last
     FROM customers c
     ${q ? "WHERE c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR c.city LIKE ?" : ""}
     ORDER BY spent DESC`,
    ...(q ? Array(4).fill(`%${q}%`) : [])
  );
  return (
    <>
      <PageHeader title="Customers" subtitle={`${rows.length} customer${rows.length === 1 ? "" : "s"}`} />
      <div className="card overflow-hidden">
        <form className="flex gap-2 border-b border-neutral-100 p-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400" />
            <input name="q" defaultValue={q} placeholder="Search name, email, phone or city" className="input pl-9" />
          </div>
          <button className="btn-secondary">Search</button>
        </form>
        {rows.length === 0 ? <Empty title="No customers found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50/60"><tr><th className="th">Customer</th><th className="th">Phone</th><th className="th">Location</th><th className="th">Orders</th><th className="th">Last order</th><th className="th text-right">Total spent</th></tr></thead>
              <tbody className="divide-y divide-neutral-100">
                {rows.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="td"><div className="font-medium">{c.name}</div><div className="text-xs text-neutral-500">{c.email}</div></td>
                    <td className="td whitespace-nowrap text-neutral-600">{c.phone}</td>
                    <td className="td text-neutral-600">{c.city}, {c.state}</td>
                    <td className="td"><Link href={`/admin/orders?q=${encodeURIComponent(c.email)}`} className="text-brand-700 hover:underline">{c.orders}</Link></td>
                    <td className="td whitespace-nowrap text-neutral-500">{c.last ? fmtDate(c.last) : "—"}</td>
                    <td className="td text-right font-medium">{inr(c.spent)}</td>
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
