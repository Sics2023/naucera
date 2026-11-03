import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { getSettings } from "@/lib/queries";
import { categoryTheme, getStoreProduct, relatedProducts, whatsappLink } from "@/lib/store";
import { profileFor, SEGMENTS } from "@/lib/product-profiles";
import ProductShowcase from "@/components/store/ProductShowcase";
import VariantPicker from "@/components/store/VariantPicker";
import ProductCard from "@/components/store/ProductCard";
import { Eyebrow, Leaf, Sprig, Wave } from "@/components/store/Decor";
import { SplitText } from "@/components/store/Motion";
import { ArrowRight, ChevronDown, Clock, Coffee, Droplets, Leaf as LeafIcon, Package, ShieldCheck, Snowflake, Sparkles, Thermometer } from "lucide-react";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getStoreProduct((await params).slug);
  if (!p) return { title: "Product not found" };
  return {
    title: { absolute: p.seo_title || `${p.title} | Naucera` },
    description: p.seo_description || p.short_description,
    openGraph: { images: p.images[0] ? [p.images[0].url] : [] },
  };
}

/** Write-up blocks shown under every product, tuned per range. Images are from naucera.in. */
function storyFor(kind: "hot" | "cold", category: string | null, title: string) {
  const isCoffee = category?.toLowerCase().includes("coffee");
  return [
    {
      eyebrow: "Our story",
      title: "Rooted in Assam since 1982",
      text: "Naucera is a brand of Vardhman Foods & Beverages, founded in 1982 in Nalbari, Assam – right in the heart of India’s tea country. From the North-East, our premixes now travel across India and to customers in the U.S.A., U.K., Dubai and New Zealand.",
      image: "/story/tea-garden.webp",
    },
    kind === "cold"
      ? {
          eyebrow: "Instant refreshment",
          title: "Chilled, refreshing, ready in seconds",
          text: `${title} is made to dissolve quickly in chilled water, so you get a consistent, refreshing drink every time – no syrups, no fuss. Just mix, add ice and serve.`,
          image: "/lifestyle/cooler-drinks.webp",
        }
      : {
          eyebrow: "Ready in seconds",
          title: isCoffee ? "Your café-style cup, without the wait" : "A perfect cup of chai, every time",
          text: `No brewing, no boiling, no mess. ${title} gives you the same great taste in every cup – just add hot water, stir and enjoy in about 30 seconds.`,
          image: isCoffee ? "/story/kadak-coffee-lifestyle.webp" : "/story/naucera-cup.webp",
        },
  ];
}

const DEFAULT_STEPS = {
  hot: ["Empty one sachet, or the recommended quantity of premix, into a cup.", "Add hot water and stir well.", "Your cup is ready in about 30 seconds – enjoy!"],
  cold: ["Add the premix to a glass of chilled water.", "Stir or shake well until fully mixed.", "Add ice cubes and serve chilled."],
};

/** "Know your Naucera" – quality pillars, from naucera.in/lp. */
const PILLARS = [
  { icon: LeafIcon, title: "Authentic regional extracts", text: "Our tea premixes deliver that signature kadak punch using genuine Assam tea extracts, while our coffee blends boast the rich, aromatic depth of premium South Indian coffee extracts." },
  { icon: Sparkles, title: "Consistent, batch after batch", text: "4,500+ MT of production delivered in the last 10 years guarantees consistent quality, batch after batch." },
  { icon: ShieldCheck, title: "Certified & quality-controlled", text: "Full production traceability with expiry-labelled, batch-tracked SKUs across every range." },
];

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await getStoreProduct(slug);
  if (!p) notFound();
  const [settings, related] = await Promise.all([getSettings(), relatedProducts(p.id, p.category_id)]);
  const theme = categoryTheme(p.category_slug);
  const profile = profileFor(p.slug, p.category_slug);
  const segment = SEGMENTS[profile.segment];
  const cold = theme.kind === "cold";
  const steps = p.how_to_use?.trim() ? p.how_to_use.split(/\n+/).map((s) => s.trim()).filter(Boolean) : DEFAULT_STEPS[theme.kind];
  const about = p.description && p.description.trim() !== p.short_description.trim() ? p.description : null;
  const story = storyFor(theme.kind, p.category_name, p.title);
  const sizes = p.variants.map((v) => v.name).join(" · ");
  const bulk = whatsappLink(settings.whatsapp, `Hi Naucera, I'm interested in bulk supply of ${p.title}.`) ?? "#contact";

  const faq = [
    { t: "About this product", b: about ?? p.short_description },
    { t: "Pack sizes", b: p.variants.map((v) => v.name).join(", ") },
    p.ingredients?.trim() ? { t: "Ingredients", b: p.ingredients } : null,
    p.shelf_life?.trim() ? { t: "Shelf life", b: p.shelf_life } : null,
    { t: "Storage", b: "Store in a cool, dry place. Close the pack tightly after use." },
    { t: "Can I use it in a vending machine?", b: "Yes. Our 1 kg packets and pouches are designed specifically for vending machines. Talk to us about the right machine and premix range for your space." },
    profile.segment === "Kadak" || profile.segment === "Select"
      ? { t: "Is it lower in sugar?", b: `${segment.title}: ${segment.text}` }
      : null,
  ].filter(Boolean) as { t: string; b: string }[];

  return (
    <>
      {/* Hero – full screen */}
      <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-cream sm:min-h-[calc(100svh-5rem)]">
        <div className="absolute inset-0 -z-10" style={{ background: `radial-gradient(70% 80% at 75% 45%, ${theme.tint} 0%, transparent 70%)` }} />
        <Sprig className="absolute top-6 -left-10 -z-10 hidden h-72 text-brand-700/20 xl:block" />
        <Sprig flip className="absolute -right-10 -bottom-10 -z-10 hidden h-80 text-brand-700/20 xl:block" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-14">
          <div className="order-2 lg:order-1">
            <nav className="text-sm text-neutral-500" aria-label="Breadcrumb">
              <Link href="/products" className="hover:text-ink">Products</Link>
              {p.category_slug && <> <span className="mx-1.5">/</span> <Link href={`/products?category=${p.category_slug}`} className="hover:text-ink">{p.category_name}</Link></>}
            </nav>
            <div className="mt-6"><Eyebrow>{segment.title.replace("The Naucera ", "")}</Eyebrow></div>
            <SplitText as="h1" text={p.title} className="mt-4 font-serif text-5xl leading-[1.02] font-semibold text-forest sm:text-7xl" />
            <p data-reveal="" style={d(300)} className="mt-4 font-serif text-2xl text-olive italic">{profile.tagline}</p>
            <p data-reveal="" style={d(420)} className="mt-5 max-w-lg text-lg leading-relaxed text-neutral-600">{p.short_description}</p>
            <div data-reveal="" style={d(540)} className="mt-8 max-w-lg"><VariantPicker title={p.title} variants={p.variants} whatsapp={settings.whatsapp} phone={settings.phone} /></div>
          </div>
          <div data-reveal="scale" className="order-1 lg:order-2">
            <ProductShowcase images={p.images} title={p.title} tint={theme.tint} />
          </div>
        </div>
      </section>

      {/* Know your premix – attribute card over a lifestyle photo */}
      <section className="relative isolate overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-parallax="0.12" src={profile.moment.image} alt="" className="h-full w-full scale-[1.15] object-cover will-change-transform" />
        </div>
        <div className="absolute inset-0 -z-10 bg-black/20" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div data-reveal="" className="rounded-[2.5rem] rounded-tr-[5rem] bg-white/95 p-8 shadow-2xl backdrop-blur sm:p-12">
            <h2 className="font-serif text-3xl font-semibold text-forest sm:text-4xl">Know your {p.title}</h2>
            <dl className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Coffee, k: "Type", v: cold ? "Instant cooler premix" : "Instant premix" },
                { icon: Sparkles, k: "Taste notes", v: profile.notes.join(" · "), script: true },
                { icon: cold ? Snowflake : Thermometer, k: "Serve", v: cold ? "Chilled, over ice" : "Hot" },
                { icon: Package, k: "Pack sizes", v: sizes || "—" },
              ].map((a, i) => (
                <div key={a.k} data-reveal="" style={d(i * 90)}>
                  <dt className="flex items-center gap-2 text-sm font-semibold text-neutral-500"><a.icon size={17} className="text-brand-600" />{a.k}</dt>
                  <dd className={`mt-2 text-lg ${a.script ? "font-serif text-forest italic" : "text-ink"}`}>{a.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-neutral-200 pt-6 text-sm text-neutral-600">
              <span className="flex items-center gap-2"><Clock size={17} className="text-brand-600" />Ready in about 30 seconds</span>
              <span className="flex items-center gap-2"><Droplets size={17} className="text-brand-600" />Just add {cold ? "chilled" : "hot"} water</span>
              <span className="flex items-center gap-2"><ShieldCheck size={17} className="text-brand-600" />FSSAI &amp; ISO certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Story – cream, leaves and a curve */}
      <section className="relative overflow-hidden bg-cream">
        <Sprig className="absolute hidden lg:block top-24 -left-4 h-80 text-brand-700/25" />
        <Sprig flip className="absolute hidden lg:block top-[45%] -right-4 h-96 text-brand-700/25" />
        <div className="mx-auto max-w-7xl space-y-20 px-4 pt-24 pb-16 sm:px-6 lg:space-y-28 lg:pt-32">
          {story.map((s, i) => (
            <article key={s.title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
              <div data-reveal="clip" className={`overflow-hidden rounded-[3rem] ${i % 2 ? "lg:order-2" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
              </div>
              <div className={i % 2 ? "lg:order-1" : ""}>
                <Eyebrow>{s.eyebrow}</Eyebrow>
                <SplitText text={s.title} className="mt-4 font-serif text-4xl leading-tight font-semibold text-forest sm:text-5xl" />
                <p data-reveal="" className="mt-6 text-lg leading-relaxed text-neutral-600">{s.text}</p>
              </div>
            </article>
          ))}
        </div>
        <Wave color="#163a2b" accent="#eadfc4" />
      </section>

      {/* How to make it */}
      <section className="relative overflow-hidden bg-forest text-white">
        <div className="pointer-events-none absolute -top-40 -right-40 size-[30rem] rounded-full bg-brand-500/15 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div>
            <Eyebrow tone="text-gold">How to make it</Eyebrow>
            <SplitText text={cold ? `Your ${p.title}, perfectly chilled` : `The perfect cup of ${p.title}`} className="mt-4 font-serif text-4xl leading-tight font-semibold sm:text-5xl" />
            <ol className="mt-10 space-y-4">
              {steps.map((s, i) => (
                <li key={i} data-reveal="right" style={d(i * 110)} className="flex items-center gap-6 rounded-3xl border border-white/10 bg-white/[0.05] p-5 sm:p-6">
                  <span className="font-serif text-5xl leading-none text-gold/80">0{i + 1}</span>
                  <p className="text-lg text-white/85">{s}</p>
                </li>
              ))}
            </ol>
            <h3 data-reveal="" className="mt-14 flex items-center gap-3 font-serif text-2xl"><Leaf className="size-5 text-gold" /> Make it your way</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {profile.ways.map((w, i) => (
                <div key={w.title} data-reveal="" style={d(i * 100)} className="rounded-3xl bg-white p-5 text-ink transition duration-500 hover:-translate-y-1.5">
                  <p className="font-serif text-lg font-semibold text-forest">{w.title}</p>
                  <p className="mt-1.5 text-sm text-neutral-600">{w.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mx-auto">
            <div className="absolute inset-6 rounded-full bg-white/10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-reveal="scale" src={cold ? "/mascot/mascot-peace.webp" : "/mascot/mascot-pouring.webp"} alt="Naucera mascot" className="relative h-80 w-auto drop-shadow-2xl sm:h-[28rem]" />
          </div>
        </div>
      </section>

      {/* The perfect moment */}
      <section className="relative isolate overflow-hidden" style={{ background: theme.tint }}>
        <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(60% 70% at 15% 30%, rgba(255,255,255,0.75) 0%, transparent 70%)" }} />
        <Sprig className="absolute top-10 -left-8 -z-10 hidden h-80 text-brand-700/20 lg:block" />
        <Sprig flip className="absolute -right-8 bottom-0 -z-10 hidden h-80 text-brand-700/20 lg:block" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-28">
          <div>
            <Eyebrow>The perfect moment</Eyebrow>
            <SplitText text={profile.moment.title} className="mt-4 font-serif text-4xl leading-tight font-semibold text-forest sm:text-6xl" />
            <p data-reveal="" className="mt-6 max-w-lg text-lg leading-relaxed text-neutral-700">{profile.moment.text}</p>
            <div data-reveal="" className="mt-10 flex items-end gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cold ? "/mascot/mascot-peace.webp" : "/mascot/mascot-cup-chin.webp"} alt="Naucera mascot" className="float-slow h-40 w-auto drop-shadow-xl sm:h-48" />
              <p className="mb-4 max-w-[14rem] rounded-2xl rounded-bl-none bg-white px-4 py-3 font-serif text-forest italic shadow-[0_15px_40px_-20px_rgba(22,58,43,0.5)]">“{profile.tagline}”</p>
            </div>
          </div>
          <div className="relative">
            <div data-reveal="clip" className="overflow-hidden rounded-[3rem] rounded-tr-[6rem] shadow-[0_40px_80px_-40px_rgba(22,58,43,0.55)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cold ? "/story/banner-range-2.webp" : profile.moment.image === "/story/office-vending.webp" ? "/vending/bakery.webp" : "/story/office-vending.webp"} alt="" loading="lazy" className="aspect-[5/4] w-full object-cover" />
            </div>
            {p.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img data-reveal="scale" style={d(400)} src={p.images[0].url} alt="" loading="lazy" className="absolute -bottom-10 -left-6 h-40 w-auto drop-shadow-[0_25px_25px_rgba(0,0,0,0.3)] sm:-left-10 sm:h-52" />
            )}
          </div>
        </div>
      </section>

      {/* Know your Naucera */}
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-28">
          <div className="text-center">
            <div className="flex justify-center"><Eyebrow>Know your Naucera</Eyebrow></div>
            <SplitText text="Real origin. Real flavour. Every cup." className="mt-4 font-serif text-4xl font-semibold text-forest sm:text-5xl" />
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {PILLARS.map((x, i) => (
              <div key={x.title} data-reveal="" style={d(i * 120)} className="rounded-[2rem] rounded-tl-[4rem] bg-white p-8 shadow-[0_20px_50px_-30px_rgba(22,58,43,0.35)]">
                <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700"><x.icon size={26} /></span>
                <h3 className="mt-6 font-serif text-2xl font-semibold text-forest">{x.title}</h3>
                <p className="mt-3 leading-relaxed text-neutral-600">{x.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Good to know + business */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <Eyebrow>Good to know</Eyebrow>
          <SplitText text="Everything about this premix" className="mt-4 font-serif text-4xl font-semibold text-forest" />
          <div className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
            {faq.map((row, i) => (
              <details key={row.t} open={i === 0} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
                  {row.t}<ChevronDown size={20} className="shrink-0 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 leading-relaxed whitespace-pre-line text-neutral-600">{row.b}</p>
              </details>
            ))}
          </div>
        </div>
        <div data-reveal="" className="relative overflow-hidden rounded-[2.5rem] rounded-tr-[6rem] bg-forest p-10 text-white">
          <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-gold/15 blur-3xl" />
          <p className="text-sm font-semibold tracking-[0.25em] text-gold uppercase">For business</p>
          <h3 className="mt-3 font-serif text-3xl leading-tight font-semibold">{p.title} for your office, café or vending route</h3>
          <p className="mt-4 text-white/75">1 kg packs built for vending machines, bulk supply for canteens and HORECA, and distributor &amp; dealer programmes.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={bulk} target={bulk.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-ink transition hover:bg-white">Request bulk pricing</a>
            <Link href="/vending-machines" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-semibold transition hover:bg-white/10">Vending machines <ArrowRight size={16} /></Link>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mascot/mascot-thumbsup.webp" alt="" className="float-slow relative mt-8 ml-auto h-56 w-auto drop-shadow-2xl" />
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-cream">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow>More from Naucera</Eyebrow>
                <SplitText text="Other premixes you might like" className="mt-4 font-serif text-4xl font-semibold text-forest" />
              </div>
              <Link href="/products" className="inline-flex items-center gap-1.5 rounded-full border border-forest px-5 py-2.5 text-sm font-semibold text-forest transition hover:bg-forest hover:text-white">
                See the full range <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
              {related.map((r, i) => <div key={r.id} data-reveal="" style={d(i * 90)}><ProductCard p={r} /></div>)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
