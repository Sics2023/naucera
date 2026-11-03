import Link from "next/link";
import { all, get } from "@/lib/db";
import { getSettings } from "@/lib/queries";
import { inr, fmtDateTime } from "@/lib/format";
import { Badge, PageHeader, Thumb } from "@/components/ui";
import RevenueChart from "@/components/RevenueChart";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";

export const metadata = { title: "Home" };

type Kpi = { revenue: number; orders: number; customers: number };

function period(fromDays: number, toDays: number): Kpi {
  return get<Kpi>(
    `SELECT COALESCE(SUM(total),0) AS revenue, COUNT(*) AS orders, COUNT(DISTINCT customer_id) AS customers
     FROM orders WHERE status != 'cancelled' AND created_at >= datetime('now', ?) AND created_at < datetime('now', ?)`,
    `-${fromDays} days`, `-${toDays} days`
  )!;
}

function Delta({ now, prev }: { now: number; prev: number }) {
  if (!prev) return null;
  const pct = ((now - prev) / prev) * 100;
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center text-xs font-medium ${up ? "text-emerald-700" : "text-red-700"}`}>
      {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{Math.abs(pct).toFixed(0)}%
    </span>
  );
}

export default function Dashboard() {
  const settings = getSettings();
  const cur = period(30, 0);
  const prev = period(60, 30);
  const aov = cur.orders ? cur.revenue / cur.orders : 0;
  const prevAov = prev.orders ? prev.revenue / prev.orders : 0;

  const daily = all<{ date: string; revenue: number; orders: number }>(
    `SELECT date(created_at) AS date, SUM(total) AS revenue, COUNT(*) AS orders FROM orders
     WHERE status != 'cancelled' AND created_at >= date('now', '-29 days') GROUP BY date(created_at)`
  );
  const byDate = new Map(daily.map((d) => [d.date, d]));
  const series = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10);
    return byDate.get(d) ?? { date: d, revenue: 0, orders: 0 };
  });

  const recent = all<{ id: number; number: string; customer: string; total: number; status: string; payment_status: string; created_at: string }>(
    `SELECT o.id, o.number, c.name AS customer, o.total, o.status, o.payment_status, o.created_at
     FROM orders o LEFT JOIN customers c ON c.id = o.customer_id ORDER BY o.created_at DESC LIMIT 6`
  );
  const top = all<{ id: number; title: string; image: string | null; units: number; revenue: number }>(
    `SELECT p.id, p.title, (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY position LIMIT 1) AS image,
       SUM(oi.qty) AS units, SUM(oi.qty * oi.price) AS revenue
     FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id
     WHERE o.status != 'cancelled' AND o.created_at >= datetime('now','-30 days')
     GROUP BY p.id ORDER BY revenue DESC LIMIT 5`
  );
  const threshold = Number(settings.low_stock_threshold || 10);
  const low = all<{ product_id: number; title: string; name: string; stock: number }>(
    `SELECT v.product_id, p.title, v.name, v.stock FROM product_variants v JOIN products p ON p.id = v.product_id
     WHERE p.status = 'active' AND v.stock <= ? ORDER BY v.stock ASC LIMIT 6`,
    threshold
  );
  const toFulfil = get<{ n: number }>("SELECT COUNT(*) AS n FROM orders WHERE status IN ('pending','processing')")!.n;
  const activeProducts = get<{ n: number }>("SELECT COUNT(*) AS n FROM products WHERE status = 'active'")!.n;

  const kpis = [
    { label: "Revenue · 30 days", value: inr(Math.round(cur.revenue)), now: cur.revenue, prev: prev.revenue },
    { label: "Orders · 30 days", value: cur.orders.toString(), now: cur.orders, prev: prev.orders },
    { label: "Average order value", value: inr(Math.round(aov)), now: aov, prev: prevAov },
    { label: "Customers who ordered", value: cur.customers.toString(), now: cur.customers, prev: prev.customers },
  ];

  return (
    <>
      <PageHeader title={`Welcome back to ${settings.store_name || "Naucera"}`} subtitle="Here’s what’s happening with your store.">
        <Link href="/admin/products/new" className="btn-primary"><Plus size={16} /> Add product</Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-4">
            <div className="text-xs font-medium text-stone-500">{k.label}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight">{k.value}</span>
              <Delta now={k.now} prev={k.prev} />
            </div>
            <div className="mt-0.5 text-[11px] text-stone-400">vs previous 30 days</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-semibold">Daily revenue</h2>
            <span className="text-xs text-stone-500">Last 30 days · excludes cancelled</span>
          </div>
          <RevenueChart data={series} />
        </div>
        <div className="card flex flex-col p-5">
          <h2 className="font-semibold">To do</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/admin/orders?status=open" className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2.5 text-amber-900 hover:bg-amber-100">
                <span><b>{toFulfil}</b> orders to fulfil</span><span>→</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/inventory?filter=low" className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2.5 hover:bg-stone-100">
                <span><b>{low.length}</b> variants low on stock</span><span>→</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/products?status=active" className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2.5 hover:bg-stone-100">
                <span><b>{activeProducts}</b> products live</span><span>→</span>
              </Link>
            </li>
          </ul>
          <h3 className="mt-5 flex items-center gap-1.5 text-sm font-semibold"><AlertTriangle size={15} className="text-amber-600" /> Low stock</h3>
          <ul className="mt-2 divide-y divide-stone-100 text-sm">
            {low.length === 0 && <li className="py-2 text-stone-500">All stocked up 🎉</li>}
            {low.map((v) => (
              <li key={v.product_id + v.name} className="flex items-center justify-between gap-2 py-2">
                <Link href={`/admin/products/${v.product_id}`} className="truncate hover:underline">{v.title} <span className="text-stone-500">· {v.name}</span></Link>
                <Badge tone={v.stock === 0 ? "out" : "low"}>{v.stock === 0 ? "Out" : `${v.stock} left`}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h2 className="font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-brand-700 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-y border-stone-100 bg-stone-50/60"><tr><th className="th">Order</th><th className="th">Customer</th><th className="th">Date</th><th className="th">Payment</th><th className="th">Status</th><th className="th text-right">Total</th></tr></thead>
              <tbody className="divide-y divide-stone-100">
                {recent.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50">
                    <td className="td font-medium"><Link href={`/admin/orders/${o.id}`} className="hover:underline">{o.number}</Link></td>
                    <td className="td whitespace-nowrap">{o.customer ?? "Guest"}</td>
                    <td className="td whitespace-nowrap text-stone-500">{fmtDateTime(o.created_at)}</td>
                    <td className="td"><Badge tone={o.payment_status} /></td>
                    <td className="td"><Badge tone={o.status} /></td>
                    <td className="td text-right font-medium">{inr(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold">Top products · 30 days</h2>
          <ul className="mt-3 space-y-3">
            {top.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="w-4 text-xs text-stone-400">{i + 1}</span>
                <Thumb src={p.image} alt={p.title} size={36} />
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/products/${p.id}`} className="block truncate text-sm font-medium hover:underline">{p.title}</Link>
                  <div className="text-xs text-stone-500">{p.units} units sold</div>
                </div>
                <div className="text-sm font-medium">{inr(Math.round(p.revenue))}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
