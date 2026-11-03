"use client";

import { useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import type { StoreVariant } from "@/lib/store";

const inr = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

export default function VariantPicker({ title, variants, whatsapp, phone }: { title: string; variants: StoreVariant[]; whatsapp?: string; phone?: string }) {
  const [sel, setSel] = useState(0);
  const v = variants[sel];
  const digits = (whatsapp || "").replace(/\D/g, "");
  const wa = digits ? `https://wa.me/${digits}?text=${encodeURIComponent(`Hi Naucera, I'd like to order / know more about ${title}${v ? ` (${v.name})` : ""}.`)}` : null;

  return (
    <div>
      {variants.length > 0 && (
        <>
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Pack size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((x, n) => (
              <button key={x.id} onClick={() => setSel(n)}
                className={`rounded-full border px-5 py-2.5 text-sm transition ${n === sel ? "border-ink bg-ink text-white" : "border-neutral-300 hover:border-ink"}`}>
                {x.name}
              </button>
            ))}
          </div>
        </>
      )}
      <div className="mt-6 flex items-baseline gap-3">
        {v && v.price > 0 ? (
          <>
            <span className="text-3xl font-semibold">{inr(v.price)}</span>
            {v.compare_at_price && v.compare_at_price > v.price && <span className="text-lg text-neutral-400 line-through">{inr(v.compare_at_price)}</span>}
            <span className="text-xs text-neutral-500">MRP incl. of all taxes</span>
          </>
        ) : (
          <span className="text-xl font-medium text-neutral-700">Price on request</span>
        )}
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-700 px-6 py-3.5 font-medium text-white transition hover:bg-brand-800">
            <MessageCircle size={18} /> Enquire on WhatsApp
          </a>
        )}
        {phone && (
          <a href={`tel:${phone.replace(/\s/g, "")}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-ink px-6 py-3.5 font-medium transition hover:bg-ink hover:text-white">
            <Phone size={18} /> Call us
          </a>
        )}
      </div>
    </div>
  );
}
