import Link from "next/link";
import { all } from "@/lib/db";
import { inr, fmtDateTime } from "@/lib/format";
import { Badge, Empty, PageHeader } from "@/components/ui";
import { Search } from "lucide-react";

export const metadata = { title: "Orders" };

const TABS = [
  { label: "All", status: "" },
  { label: "Open", status: "open" },
  { label: "Pending", status: "pending" },
  { label: "Processing", status: "processing" },
  { label: "Shipped", status: "shipped" },
  { label: "Delivered", status: "delivered" },
  { label: "Cancelled", status: "cancelled" },
];

export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; payment?: string }> }) {
  const sp = await searchParams;
  const where: string[] = [];
  const params: string[] = [];
  if (sp.status === "open") where.push("o.status IN ('pending','processing')");
  else if (sp.status) { where.push("o.status = ?"); params.push(sp.status); }
  if (sp.payment) { where.push("o.payment_status = ?"); params.push(sp.payment); }
  if (sp.q) { where.push("(o.number LIKE ? OR c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)"); params.push(...Array(4).fill(`%${sp.q}%`)); }
  const orders = await all<{ id: number; number: string; customer: string | null; city: string | null; total: number; status: string; payment_status: string; payment_method: string; created_at: string; items: number }>(
    `SELECT o.id, o.number, c.name AS customer, c.city, o.total, o.status, o.payment_status, o.payment_method, o.created_at,
       (SELECT SUM(qty) FROM order_items oi WHERE oi.order_id = o.id) AS items
     FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
     ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY o.created_at DESC LIMIT 200`,
    ...params
  );

  return (
    <>
      <PageHeader title="Orders" subtitle={`${orders.length} order${orders.length === 1 ? "" : "s"}`} />
      <div className="card overflow-hidden">
        <div className="flex gap-1 overflow-x-auto border-b border-neutral-100 px-3 pt-2">
          {TABS.map((t) => (
            <Link key={t.label} href={`/admin/orders${t.status ? `?status=${t.status}` : ""}`}
              className={`-mb-px border-b-2 px-3 py-2 text-sm whitespace-nowrap ${(sp.status ?? "") === t.status ? "border-brand-700 font-medium" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}>{t.label}</Link>
          ))}
        </div>
        <form className="flex flex-wrap gap-2 border-b border-neutral-100 p-3">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <div className="relative min-w-56 flex-1">
            <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400" />
            <input name="q" defaultValue={sp.q} placeholder="Search order #, customer name, email or phone" className="input pl-9" />
          </div>
          <select name="payment" defaultValue={sp.payment ?? ""} className="input w-auto">
            <option value="">Any payment</option><option value="paid">Paid</option><option value="pending">Payment pending</option><option value="refunded">Refunded</option>
          </select>
          <button className="btn-secondary">Filter</button>
        </form>
        {orders.length === 0 ? <Empty title="No orders found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50/60"><tr><th className="th">Order</th><th className="th">Date</th><th className="th">Customer</th><th className="th">Payment</th><th className="th">Fulfilment</th><th className="th">Items</th><th className="th text-right">Total</th></tr></thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50">
                    <td className="td font-medium"><Link href={`/admin/orders/${o.id}`} className="hover:underline">{o.number}</Link></td>
                    <td className="td whitespace-nowrap text-neutral-500">{fmtDateTime(o.created_at)}</td>
                    <td className="td whitespace-nowrap">{o.customer ?? "Guest"}<span className="block text-xs text-neutral-500">{o.city}</span></td>
                    <td className="td"><Badge tone={o.payment_status} /><span className="block pt-0.5 text-xs text-neutral-500">{o.payment_method}</span></td>
                    <td className="td"><Badge tone={o.status} /></td>
                    <td className="td text-neutral-600">{o.items}</td>
                    <td className="td text-right font-medium">{inr(o.total)}</td>
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
