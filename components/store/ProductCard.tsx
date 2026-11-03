import Link from "next/link";
import { categoryTheme, priceLabel, type StoreCard } from "@/lib/store";
import { ArrowRight } from "lucide-react";

export default function ProductCard({ p }: { p: StoreCard }) {
  const theme = categoryTheme(p.category_slug);
  const price = priceLabel(p.min_price, p.max_price);
  return (
    <Link href={`/products/${p.slug}`} className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl" style={{ background: theme.tint }}>
        <div className="absolute inset-x-8 bottom-6 h-6 rounded-[50%] bg-black/10 blur-md" />
        {p.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.title} loading="lazy" className="relative h-full w-full object-contain p-8 transition duration-500 group-hover:scale-105" />
        )}
        <span className="absolute top-4 left-4 rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium tracking-wide uppercase" style={{ color: theme.deep }}>
          {p.category_name?.replace(" Premixes", "")}
        </span>
      </div>
      <div className="mt-4 px-1">
        <h3 className="font-serif text-xl font-semibold text-ink">{p.title}</h3>
        {p.sizes && <p className="mt-0.5 text-xs tracking-wide text-neutral-500 uppercase">{p.sizes}</p>}
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{p.short_description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
            Discover <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </span>
          {price && <span className="text-sm font-medium text-ink">{price}</span>}
        </div>
      </div>
    </Link>
  );
}
