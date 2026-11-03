import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ArrowRight, Coffee, Droplets, Snowflake, Timer } from "lucide-react";
import { categoryTheme, listStoreCategories, listStoreProducts, type StoreCard } from "@/lib/store";
import { SEGMENTS } from "@/lib/product-profiles";
import ProductCard from "@/components/store/ProductCard";
import PageHero from "@/components/store/PageHero";
import { Eyebrow, Sprig, Wave } from "@/components/store/Decor";
import { Marquee, SplitText } from "@/components/store/Motion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Premixes",
  description: "Naucera tea, coffee and cooler premixes – 1 kg packs and single-serve sachets, ready in seconds.",
};

/** Hero photo and banner line per category. */
const CATEGORY_LOOK: Record<string, { hero: string; banner: string; line: string }> = {
  tea: { hero: "/story/tea-garden.webp", banner: "/lifestyle/kadak-tea-scene.webp", line: "Made with authentic Assam tea extracts – that signature kadak punch, in seconds." },
  coffee: { hero: "/story/kadak-coffee-lifestyle.webp", banner: "/lifestyle/coffee-pour.webp", line: "The rich, aromatic depth of premium South Indian coffee extracts." },
  cooler: { hero: "/lifestyle/cooler-drinks.webp", banner: "/lifestyle/cooler-drinks.webp", line: "Iced, Bold & Beautiful! – instant cold refreshment for the hottest days." },
};
const lookFor = (slug: string) => CATEGORY_LOOK[slug.includes("cooler") ? "cooler" : slug.includes("coffee") ? "coffee" : "tea"];

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [categories, products, all] = await Promise.all([listStoreCategories(), listStoreProducts(category), category ? listStoreProducts() : Promise.resolve(null)]);
  const active = categories.find((c) => c.slug === category);
  const total = categories.reduce((s, c) => s + Number(c.count), 0);
  const packs = (all ?? products).filter((p) => p.image);

  // "All" view: one section per category, like a range page.
  const groups: { name: string; slug: string; description: string; items: StoreCard[] }[] = active
    ? [{ name: active.name, slug: active.slug, description: active.description, items: products }]
    : categories.map((c) => ({ name: c.name, slug: c.slug, description: c.description, items: products.filter((p) => p.category_slug === c.slug) }));
  const look = active ? lookFor(active.slug) : null;

  return (
    <>
      <PageHero
        eyebrow={active ? "Naucera Premixes" : "Instantly refreshing · Anytime, anywhere"}
        title={active ? active.name : "Our Premixes"}
        image={look?.hero ?? "/story/banner-range.webp"}
        text={look?.line ?? "Tea, coffee and cooler premixes from the heart of Assam – a great-tasting cup, ready in seconds. For your home, your office and your business."}
        aside={active && products[0]?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={products[0].image} alt="" className="float-slow h-[26rem] w-auto object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]" />
        ) : undefined}
      >
        <a href="#range" className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-white">
          Explore the range <ArrowRight size={18} />
        </a>
        <Link href="/vending-machines" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20">
          Bulk &amp; dealer enquiries
        </Link>
      </PageHero>

      {/* Brand intro + segments */}
      {!active && (
        <section className="relative overflow-hidden bg-cream">
          <Sprig className="absolute hidden lg:block top-10 -left-6 h-72 text-brand-700/25" />
          <Sprig flip className="absolute hidden lg:block -right-6 bottom-24 h-80 text-brand-700/25" />
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
            <div className="mx-auto max-w-4xl text-center">
              <div className="flex justify-center"><Eyebrow>The Naucera range</Eyebrow></div>
              <p data-reveal="blur" className="mt-6 font-serif text-3xl leading-snug text-forest sm:text-5xl sm:leading-tight">
                Real Assam tea. Premium South Indian coffee. Coolers that are iced, bold &amp; beautiful.
              </p>
              <p data-reveal="" className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
                Every Naucera premix is made in our own facility in Nalbari, Assam, so the cup you pour on day 300 tastes exactly like the one on day one.
              </p>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {(["Kadak", "Select", "Coolers"] as const).map((k, i) => {
                const s = SEGMENTS[k];
                return (
                  <article key={k} data-reveal="" style={d(i * 120)} className="group relative overflow-hidden rounded-[2.5rem] rounded-tr-[5rem] bg-white p-8 shadow-[0_20px_60px_-30px_rgba(22,58,43,0.35)] transition duration-500 hover:-translate-y-2">
                    <div className="absolute -top-16 -right-16 size-56 rounded-full opacity-80 transition duration-700 group-hover:scale-125" style={{ background: s.tint }} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image} alt="" loading="lazy" className="relative mx-auto h-56 w-auto object-contain drop-shadow-xl transition duration-700 group-hover:-translate-y-2 group-hover:-rotate-3" />
                    <h3 className="relative mt-6 font-serif text-2xl font-semibold text-forest">{s.title}</h3>
                    <p className="relative mt-2 text-neutral-600">{s.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
          <Wave color="#ffffff" accent="#efe3c8" />
        </section>
      )}

      {/* Category tabs */}
      <div id="range" className="sticky top-16 z-20 scroll-mt-16 border-b border-neutral-200 bg-white/90 backdrop-blur sm:top-20 sm:scroll-mt-20">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {[{ slug: "", name: "All", count: total }, ...categories].map((c) => {
            const on = (category ?? "") === c.slug;
            return (
              <Link key={c.slug || "all"} href={c.slug ? `/products?category=${c.slug}#range` : "/products#range"}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${on ? "border-forest bg-forest text-white" : "border-neutral-300 text-neutral-700 hover:border-forest"}`}>
                {c.name} <span className={on ? "text-white/60" : "text-neutral-400"}>{c.count}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        {products.length === 0 && <p className="py-20 text-center text-neutral-500">No products here yet.</p>}
        {groups.filter((g) => g.items.length).map((g, gi) => {
          const l = lookFor(g.slug);
          return (
            <section key={g.slug} className="mb-24 last:mb-0">
              {/* Category banner */}
              <div className="relative mb-12 grid items-center gap-8 overflow-hidden rounded-[2.5rem] rounded-bl-[6rem] p-6 sm:p-10 lg:grid-cols-2" style={{ background: categoryTheme(g.slug).tint }}>
                <div className={gi % 2 ? "lg:order-2" : ""}>
                  <Eyebrow>{g.name.replace(" Premixes", "")}</Eyebrow>
                  <SplitText text={g.name} className="mt-4 font-serif text-4xl font-semibold text-forest sm:text-5xl" />
                  <p data-reveal="" className="mt-4 max-w-md text-lg text-neutral-700">{l.line}</p>
                  <p data-reveal="" className="mt-2 text-sm text-neutral-500">{g.description}</p>
                  {!active && (
                    <Link href={`/products?category=${g.slug}`} data-reveal="" className="mt-6 inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:gap-2.5">
                      Explore {g.name.toLowerCase()} <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
                <div data-reveal="clip" className={`overflow-hidden rounded-[2rem] ${gi % 2 ? "lg:order-1" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.banner} alt="" loading="lazy" className="aspect-[16/11] w-full object-cover" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                {g.items.map((p, i) => (
                  <div key={p.id} data-reveal="" style={d((i % 4) * 90)}><ProductCard p={p} /></div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* How to make */}
      <section className="relative overflow-hidden bg-cream">
        <Sprig className="absolute hidden lg:block top-16 -right-4 h-72 text-brand-700/25" flip />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:py-28">
          <div className="relative mx-auto">
            <div className="absolute inset-8 rounded-full bg-brand-100" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-reveal="scale" src="/mascot/mascot-pouring.webp" alt="Naucera mascot pouring tea" className="relative h-80 w-auto sm:h-[26rem]" />
          </div>
          <div>
            <Eyebrow>Ready in seconds</Eyebrow>
            <SplitText text="The perfect cup, every time" className="mt-4 font-serif text-4xl font-semibold text-forest sm:text-5xl" />
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {[
                { icon: Coffee, title: "Hot tea & coffee", steps: ["Add the premix or one sachet to a cup.", "Pour hot water and stir well.", "Enjoy in about 30 seconds."] },
                { icon: Snowflake, title: "Coolers", steps: ["Add the premix to chilled water.", "Stir or shake until mixed.", "Add ice and serve chilled."] },
              ].map((b, i) => (
                <div key={b.title} data-reveal="" style={d(i * 120)} className="rounded-[2rem] bg-white p-7 shadow-[0_20px_50px_-30px_rgba(22,58,43,0.35)]">
                  <b.icon className="text-brand-600" size={26} />
                  <h3 className="mt-4 font-serif text-2xl font-semibold text-forest">{b.title}</h3>
                  <ol className="mt-4 space-y-3">
                    {b.steps.map((s, n) => (
                      <li key={s} className="flex gap-3 text-neutral-700"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">{n + 1}</span>{s}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
            <ul data-reveal="" className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-neutral-600">
              <li className="flex items-center gap-2"><Timer size={17} className="text-brand-600" /> Ready in ~30 seconds</li>
              <li className="flex items-center gap-2"><Droplets size={17} className="text-brand-600" /> Just add water</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pack strip */}
      <Marquee speed={60} className="bg-white py-10">
        {packs.map((p) => (
          <Link key={p.id} href={`/products/${p.slug}`} className="mx-7 shrink-0" aria-label={p.title}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image!} alt="" loading="lazy" className="h-40 w-auto object-contain drop-shadow-xl transition duration-500 hover:-translate-y-2 sm:h-48" />
          </Link>
        ))}
      </Marquee>

      {/* For business */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] rounded-tl-[6rem] bg-forest px-6 py-14 text-white sm:px-14">
          <div className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full bg-gold/15 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <Eyebrow tone="text-gold">For business</Eyebrow>
              <SplitText text="Buying for an office, café or vending route?" className="mt-4 max-w-2xl font-serif text-4xl leading-tight font-semibold sm:text-5xl" />
              <p data-reveal="" className="mt-5 max-w-2xl text-lg text-white/80">
                1 kg packs built for vending machines, bulk supply for canteens and HORECA, distributor and dealer programmes, and white-label manufacturing – backed by 9,000+ active vending machines and 57+ distributors.
              </p>
              <div data-reveal="" className="mt-8 flex flex-wrap gap-3">
                <Link href="/vending-machines" className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-white">
                  Vending &amp; bulk supply <ArrowRight size={18} />
                </Link>
                <Link href="/about" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-semibold transition hover:-translate-y-0.5 hover:bg-white/10">About Naucera</Link>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-reveal="scale" src="/mascot/mascot-thumbsup.webp" alt="" className="float-slow mx-auto h-64 w-auto drop-shadow-2xl sm:h-72" />
          </div>
        </div>
      </section>
    </>
  );
}
