"use client";

import { startTransition, useActionState, useMemo, useState } from "react";
import { createOrder } from "@/app/admin/actions";
import { inr, ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/format";
import { Thumb } from "@/components/ui";
import { Loader2, Plus, Search, Trash2, UserRound } from "lucide-react";

export type PickerProduct = { id: number; title: string; draft: boolean; image: string | null; variants: { id: number; name: string; sku: string; price: number; stock: number }[] };
export type PickerCustomer = { id: number; name: string; email: string | null; phone: string; city: string; state: string };

type Line = { key: string; product_id: number | null; variant_id: number | null; title: string; variant_name: string; image: string | null; price: string; qty: string; stock: number | null };

let k = 0;
const key = () => `l${++k}`;

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default function OrderForm({ products, customers, now }: { products: PickerProduct[]; customers: PickerCustomer[]; now: string }) {
  const [state, action, pending] = useActionState(createOrder, undefined);
  const [lines, setLines] = useState<Line[]>([]);
  const [query, setQuery] = useState("");
  const [cust, setCust] = useState({ name: "", phone: "", email: "", city: "", state: "" });
  const [custQuery, setCustQuery] = useState("");
  const [shipping, setShipping] = useState("0");
  const [discount, setDiscount] = useState("0");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.title.toLowerCase().includes(q) || p.variants.some((v) => v.sku.toLowerCase().includes(q))).slice(0, 8);
  }, [query, products]);

  const custMatches = useMemo(() => {
    const q = custQuery.trim().toLowerCase();
    if (!q) return [];
    return customers.filter((c) => [c.name, c.phone, c.email ?? ""].some((f) => f.toLowerCase().includes(q))).slice(0, 6);
  }, [custQuery, customers]);

  const addVariant = (p: PickerProduct, v: PickerProduct["variants"][number]) => {
    setLines((ls) => {
      const found = ls.find((l) => l.variant_id === v.id);
      if (found) return ls.map((l) => (l === found ? { ...l, qty: String(Number(l.qty || 0) + 1) } : l));
      return [...ls, { key: key(), product_id: p.id, variant_id: v.id, title: p.title, variant_name: v.name, image: p.image, price: v.price ? String(v.price) : "", qty: "1", stock: v.stock }];
    });
    setQuery("");
  };
  const addCustom = () => setLines((ls) => [...ls, { key: key(), product_id: null, variant_id: null, title: "", variant_name: "", image: null, price: "", qty: "1", stock: null }]);
  const update = (key: string, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const subtotal = lines.reduce((s, l) => s + (Number(l.price) || 0) * (Number(l.qty) || 0), 0);
  const total = Math.max(0, subtotal + (Number(shipping) || 0) - (Number(discount) || 0));
  const missingPrice = lines.some((l) => l.title && !(Number(l.price) > 0));

  return (
    <form
      className="grid gap-4 lg:grid-cols-3"
      // Submit manually so React doesn't clear the form when validation fails.
      onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }}
    >
      <input type="hidden" name="items" value={JSON.stringify(lines.map(({ product_id, variant_id, title, variant_name, price, qty }) => ({ product_id, variant_id, title, variant_name, price, qty })))} />

      <div className="space-y-4 lg:col-span-2">
        <Card title="Items" action={<button type="button" onClick={addCustom} className="text-sm font-medium text-brand-700 hover:underline">+ Custom item</button>}>
          <div className="relative">
            <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products to add (e.g. Kadak Tea)" className="input pl-9" aria-label="Search products" />
            {matches.length > 0 && (
              <ul className="absolute inset-x-0 top-full z-10 mt-1 max-h-80 overflow-auto rounded-lg border border-neutral-200 bg-white shadow-lg">
                {matches.map((p) => p.variants.map((v) => (
                  <li key={v.id}>
                    <button type="button" onClick={() => addVariant(p, v)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-neutral-50">
                      <Thumb src={p.image} alt={p.title} size={36} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{p.title}{p.draft && <span className="ml-1.5 text-xs font-normal text-neutral-400">(not in store)</span>}</span>
                        <span className="block text-xs text-neutral-500">{v.name}{v.sku ? ` · ${v.sku}` : ""} · {v.stock} in stock</span>
                      </span>
                      <span className="text-sm text-neutral-600">{v.price ? inr(v.price) : "No price"}</span>
                    </button>
                  </li>
                )))}
              </ul>
            )}
            {query.trim() && matches.length === 0 && <p className="mt-2 text-sm text-neutral-500">No products match “{query}”. Use “+ Custom item” for anything else.</p>}
          </div>

          {lines.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">Search above to add products to this order.</p>
          ) : (
            <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
              {lines.map((l) => (
                <li key={l.key} className="flex flex-wrap items-center gap-3 p-3">
                  <Thumb src={l.image} alt={l.title} size={44} />
                  <div className="min-w-40 flex-1">
                    {l.variant_id ? (
                      <>
                        <div className="text-sm font-medium">{l.title}</div>
                        <div className="text-xs text-neutral-500">{l.variant_name}{l.stock != null && Number(l.qty) > l.stock ? <span className="text-amber-700"> · only {l.stock} in stock</span> : null}</div>
                      </>
                    ) : (
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        <input value={l.title} onChange={(e) => update(l.key, { title: e.target.value })} placeholder="Item name" className="input py-1.5" aria-label="Item name" />
                        <input value={l.variant_name} onChange={(e) => update(l.key, { variant_name: e.target.value })} placeholder="Size / note (optional)" className="input py-1.5" aria-label="Size" />
                      </div>
                    )}
                  </div>
                  <label className="flex items-center gap-1 text-sm text-neutral-500">₹
                    <input type="number" min="0" step="0.01" value={l.price} onChange={(e) => update(l.key, { price: e.target.value })} placeholder="Price" className={`input w-24 py-1.5 ${l.title && !(Number(l.price) > 0) ? "border-amber-400" : ""}`} aria-label="Price each" />
                  </label>
                  <span className="text-neutral-400">×</span>
                  <input type="number" min="1" step="1" value={l.qty} onChange={(e) => update(l.key, { qty: e.target.value })} className="input w-16 py-1.5" aria-label="Quantity" />
                  <div className="w-24 text-right text-sm font-medium">{inr((Number(l.price) || 0) * (Number(l.qty) || 0))}</div>
                  <button type="button" onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} className="rounded p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600" title="Remove"><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
          )}
          {missingPrice && <p className="text-sm text-amber-700">Some items have no price yet. Enter the price you agreed with the customer.</p>}

          <dl className="space-y-2 border-t border-neutral-100 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-neutral-600">Subtotal</dt><dd>{inr(subtotal)}</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-neutral-600"><label htmlFor="shipping">Shipping / delivery</label></dt>
              <dd className="flex items-center gap-1 text-neutral-500">₹<input id="shipping" name="shipping" type="number" min="0" step="0.01" value={shipping} onChange={(e) => setShipping(e.target.value)} className="input w-28 py-1.5 text-right" /></dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-neutral-600"><label htmlFor="discount">Discount</label></dt>
              <dd className="flex items-center gap-1 text-neutral-500">− ₹<input id="discount" name="discount" type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} className="input w-28 py-1.5 text-right" /></dd></div>
            <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold"><dt>Total</dt><dd>{inr(total)}</dd></div>
          </dl>
        </Card>

        <Card title="Customer">
          {customers.length > 0 && (
            <div className="relative">
              <UserRound size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400" />
              <input value={custQuery} onChange={(e) => setCustQuery(e.target.value)} placeholder="Find an existing customer by name, phone or email" className="input pl-9" aria-label="Find customer" />
              {custMatches.length > 0 && (
                <ul className="absolute inset-x-0 top-full z-10 mt-1 rounded-lg border border-neutral-200 bg-white shadow-lg">
                  {custMatches.map((c) => (
                    <li key={c.id}>
                      <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
                        onClick={() => { setCust({ name: c.name, phone: c.phone, email: c.email ?? "", city: c.city, state: c.state }); setCustQuery(""); }}>
                        <span className="font-medium">{c.name}</span> <span className="text-neutral-500">· {[c.phone, c.email, c.city].filter(Boolean).join(" · ")}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label" htmlFor="customer_name">Name *</label>
              <input id="customer_name" name="customer_name" required value={cust.name} onChange={(e) => setCust({ ...cust, name: e.target.value })} className="input" placeholder="Customer or business name" /></div>
            <div><label className="label" htmlFor="customer_phone">Phone</label>
              <input id="customer_phone" name="customer_phone" type="tel" value={cust.phone} onChange={(e) => setCust({ ...cust, phone: e.target.value })} className="input" placeholder="+91 98765 43210" /></div>
            <div><label className="label" htmlFor="customer_email">Email</label>
              <input id="customer_email" name="customer_email" type="email" value={cust.email} onChange={(e) => setCust({ ...cust, email: e.target.value })} className="input" placeholder="Optional" /></div>
            <div className="sm:col-span-2"><label className="label" htmlFor="address">Delivery address</label>
              <textarea id="address" name="address" rows={2} className="input" placeholder="House / shop, street, area" /></div>
            <div><label className="label" htmlFor="city">City</label>
              <input id="city" name="city" value={cust.city} onChange={(e) => setCust({ ...cust, city: e.target.value })} className="input" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label" htmlFor="state">State</label>
                <input id="state" name="state" value={cust.state} onChange={(e) => setCust({ ...cust, state: e.target.value })} className="input" /></div>
              <div><label className="label" htmlFor="pincode">PIN code</label>
                <input id="pincode" name="pincode" inputMode="numeric" className="input" /></div>
            </div>
          </div>
          <p className="hint">Phone or email is required. If a customer with the same phone or email exists, the order is added to them.</p>
        </Card>
      </div>

      <div className="space-y-4">
        <Card title="Payment & status">
          <div><label className="label" htmlFor="payment_method">Payment method</label>
            <select id="payment_method" name="payment_method" className="input" defaultValue="UPI">
              {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
            </select></div>
          <div><label className="label" htmlFor="payment_status">Payment status</label>
            <select id="payment_status" name="payment_status" className="input capitalize" defaultValue="pending">
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></div>
          <div><label className="label" htmlFor="status">Fulfilment status</label>
            <select id="status" name="status" className="input capitalize" defaultValue="pending">
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></div>
          <div><label className="label" htmlFor="created_at">Order date</label>
            <input id="created_at" name="created_at" type="datetime-local" defaultValue={now} className="input" /></div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="deduct_stock" defaultChecked className="mt-0.5 size-4 accent-brand-700" />
            <span>Reduce stock for these items<span className="block text-xs text-neutral-500">Untick if the stock was already adjusted.</span></span>
          </label>
          <div><label className="label" htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" rows={3} className="input" placeholder="e.g. Ordered on WhatsApp, deliver after 5 pm" /></div>
        </Card>

        {state?.error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{state.error}</p>}
        <button className="btn-primary w-full" disabled={pending || lines.length === 0}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create order · {inr(total)}
        </button>
      </div>
    </form>
  );
}
