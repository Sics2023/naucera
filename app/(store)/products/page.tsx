import Link from "next/link";
import type { Metadata } from "next";
import { listStoreCategories, listStoreProducts, type StoreCard } from "@/lib/store";
import ProductCard from "@/components/store/ProductCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Premixes",
  description: "Naucera tea, coffee and cooler premixes – 1 kg packs and single-serve sachets, ready in seconds.",
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [categories, products] = await Promise.all([listStoreCategories(), listStoreProducts(category)]);
  const active = categories.find((c) => c.slug === category);
  const total = categories.reduce((s, c) => s + Number(c.count), 0);

  // "All" view: one section per category, like a range page.
  const groups: { name: string; slug: string; description: string; items: StoreCard[] }[] = active
    ? [{ name: active.name, slug: active.slug, description: active.description, items: products }]
    : categories.map((c) => ({ name: c.name, slug: c.slug, description: c.description, items: products.filter((p) => p.category_slug === c.slug) }));

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-teal text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/story/banner-range.webp" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-teal via-teal/80 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm font-medium tracking-[0.25em] text-gold uppercase">Naucera</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight font-semibold sm:text-6xl">{active ? active.name : "Our Premixes"}</h1>
          <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            {active?.description || "Tea, coffee and cooler premixes from the heart of Assam – a great-tasting cup, ready in seconds."}
          </p>
        </div>
      </section>

      {/* Category tabs */}
      <div className="sticky top-16 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur sm:top-20">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {[{ slug: "", name: "All", count: total }, ...categories].map((c) => {
            const on = (category ?? "") === c.slug;
            return (
              <Link key={c.slug || "all"} href={c.slug ? `/products?category=${c.slug}` : "/products"}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${on ? "border-ink bg-ink text-white" : "border-neutral-300 text-neutral-700 hover:border-ink"}`}>
                {c.name} <span className={on ? "text-white/60" : "text-neutral-400"}>{c.count}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        {products.length === 0 && <p className="py-20 text-center text-neutral-500">No products here yet.</p>}
        {groups.filter((g) => g.items.length).map((g) => (
          <section key={g.slug} className="mb-16 last:mb-0">
            {!active && (
              <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-neutral-200 pb-4">
                <div>
                  <h2 className="font-serif text-3xl font-semibold">{g.name}</h2>
                  <p className="mt-1 text-sm text-neutral-500">{g.description}</p>
                </div>
                <Link href={`/products?category=${g.slug}`} className="text-sm font-semibold text-brand-700 hover:underline">View all {g.items.length} →</Link>
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {g.items.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
