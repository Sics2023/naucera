import Link from "next/link";
import { notFound } from "next/navigation";
import { all, get } from "@/lib/db";
import type { Order } from "@/lib/queries";
import { inr, fmtDateTime, ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/format";
import { Badge, Flash, PageHeader, Thumb } from "@/components/ui";
import { deleteOrder, updateOrder } from "../../../actions";
import ConfirmButton from "@/components/ConfirmButton";
import { Check } from "lucide-react";

export default async function OrderDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; created?: string }> }) {
  const id = Number((await params).id);
  const { saved, created } = await searchParams;
  const order = await get<Order>("SELECT * FROM orders WHERE id = ?", id);
  if (!order) notFound();
  const customer = order.customer_id ? await get<{ id: number; name: string; email: string | null; phone: string }>("SELECT * FROM customers WHERE id = ?", order.customer_id) : undefined;
  const orderCount = customer ? (await get<{ n: number }>("SELECT COUNT(*) AS n FROM orders WHERE customer_id = ?", customer.id))!.n : 0;
  const items = await all<{ id: number; product_id: number | null; title: string; variant_name: string; price: number; qty: number; image: string | null; sku: string | null }>(
    `SELECT oi.*, v.sku, (SELECT url FROM product_images i WHERE i.product_id = oi.product_id ORDER BY position LIMIT 1) AS image
     FROM order_items oi LEFT JOIN product_variants v ON v.id = oi.variant_id WHERE oi.order_id = ?`, id
  );
  const steps = ["pending", "processing", "shipped", "delivered"];
  const stepIdx = steps.indexOf(order.status);

  return (
    <>
      <PageHeader title={`Order ${order.number}`} subtitle={fmtDateTime(order.created_at)} back={{ href: "/admin/orders", label: "Orders" }}>
        <Badge tone={order.payment_status} /><Badge tone={order.status} />
      </PageHeader>
      <Flash show={saved === "1"}>Order updated.</Flash>
      <Flash show={created === "1"}>Order {order.number} created.</Flash>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {order.status !== "cancelled" && (
            <div className="card p-5">
              <ol className="flex items-center">
                {steps.map((s, i) => (
                  <li key={s} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`grid size-7 place-items-center rounded-full text-xs font-semibold ${i <= stepIdx ? "bg-brand-700 text-white" : "bg-neutral-100 text-neutral-400"}`}>{i < stepIdx ? <Check size={14} /> : i + 1}</span>
                      <span className={`text-xs capitalize ${i <= stepIdx ? "font-medium text-neutral-800" : "text-neutral-400"}`}>{s}</span>
                    </div>
                    {i < steps.length - 1 && <div className={`mx-2 mb-5 h-0.5 flex-1 ${i < stepIdx ? "bg-brand-700" : "bg-neutral-200"}`} />}
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div className="card overflow-hidden">
            <h2 className="px-5 pt-4 pb-2 font-semibold">Items</h2>
            <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-3 px-5 py-3">
                  <Thumb src={it.image} alt={it.title} size={44} />
                  <div className="min-w-0 flex-1">
                    {it.product_id ? <Link href={`/admin/products/${it.product_id}`} className="font-medium hover:underline">{it.title}</Link> : <span className="font-medium">{it.title}</span>}
                    <div className="text-xs text-neutral-500">{it.variant_name}{it.sku ? ` · ${it.sku}` : ""}</div>
                  </div>
                  <div className="text-sm text-neutral-600">{inr(it.price)} × {it.qty}</div>
                  <div className="w-24 text-right text-sm font-medium">{inr(it.price * it.qty)}</div>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-neutral-100 bg-neutral-50/60 px-5 py-4 text-sm">
              <div className="flex justify-between"><dt className="text-neutral-600">Subtotal</dt><dd>{inr(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-600">Shipping</dt><dd>{order.shipping ? inr(order.shipping) : "Free"}</dd></div>
              {order.discount > 0 && <div className="flex justify-between"><dt className="text-neutral-600">Discount</dt><dd className="text-emerald-700">− {inr(order.discount)}</dd></div>}
              <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold"><dt>Total</dt><dd>{inr(order.total)}</dd></div>
              <div className="flex justify-between text-xs text-neutral-500"><dt>Paid via</dt><dd>{order.payment_method}</dd></div>
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <form action={updateOrder} className="card space-y-4 p-5">
            <input type="hidden" name="id" value={order.id} />
            <h2 className="font-semibold">Update order</h2>
            <div>
              <label className="label" htmlFor="status">Fulfilment status</label>
              <select id="status" name="status" className="input capitalize" defaultValue={order.status}>
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="payment_status">Payment status</label>
              <select id="payment_status" name="payment_status" className="input capitalize" defaultValue={order.payment_status}>
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="notes">Internal notes</label>
              <textarea id="notes" name="notes" rows={3} className="input" defaultValue={order.notes} placeholder="Courier, AWB number, etc." />
            </div>
            <button className="btn-primary w-full">Save</button>
          </form>
          <div className="card p-5 text-sm">
            <h2 className="font-semibold">Customer</h2>
            {customer ? (
              <div className="mt-2 space-y-0.5">
                <Link href={`/admin/customers?q=${encodeURIComponent(customer.phone || customer.email || customer.name)}`} className="font-medium text-brand-700 hover:underline">{customer.name}</Link>
                <div className="text-neutral-500">{orderCount} order{orderCount === 1 ? "" : "s"}</div>
                {customer.email && <div className="pt-2">{customer.email}</div>}
                <div>{customer.phone}</div>
              </div>
            ) : <p className="mt-2 text-neutral-500">Guest checkout</p>}
            <h3 className="mt-4 font-semibold">Shipping address</h3>
            <p className="mt-1 whitespace-pre-line text-neutral-700">{order.shipping_address || <span className="text-neutral-500">Not given</span>}</p>
          </div>
          <form action={deleteOrder} className="card space-y-3 p-5 text-sm">
            <input type="hidden" name="id" value={order.id} />
            <h2 className="font-semibold">Delete order</h2>
            <p className="text-neutral-500">For orders added by mistake. To keep a record, set the status to Cancelled instead.</p>
            <label className="flex items-center gap-2"><input type="checkbox" name="restock" className="size-4 accent-brand-700" /> Put the items back in stock</label>
            <ConfirmButton message={`Delete order ${order.number}? This can’t be undone.`}>Delete order</ConfirmButton>
          </form>
        </div>
      </div>
    </>
  );
}
