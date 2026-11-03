import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";
import { categoryTheme, getStoreProduct, relatedProducts } from "@/lib/store";
import Gallery from "@/components/store/Gallery";
import VariantPicker from "@/components/store/VariantPicker";
import ProductCard from "@/components/store/ProductCard";
import { ChevronDown, Clock, Leaf, ShieldCheck } from "lucide-react";

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
          image: "/story/banner-range-2.webp",
        }
      : {
          eyebrow: "Ready in seconds",
          title: isCoffee ? "Your café-style cup, without the wait" : "A perfect cup of chai, every time",
          text: `No brewing, no boiling, no mess. ${title} gives you the same great taste in every cup – just add hot water, stir and enjoy in about 30 seconds.`,
          image: isCoffee ? "/story/kadak-coffee-lifestyle.webp" : "/story/naucera-cup.webp",
        },
    {
      eyebrow: "For every setting",
      title: "Homes, offices, cafés & vending",
      text: "From single-serve sachets to 1 kg packs for vending machines and canteens, Naucera premixes are made to serve one cup or hundreds. Our team can help you set up a Naucera vending machine and keep it stocked.",
      image: "/story/office-vending.webp",
    },
  ];
}

const DEFAULT_STEPS = {
  hot: ["Empty one sachet, or the recommended quantity of premix, into a cup.", "Add hot water and stir well.", "Your cup is ready in about 30 seconds – enjoy!"],
  cold: ["Add the premix to a glass of chilled water.", "Stir or shake well until fully mixed.", "Add ice cubes and serve chilled."],
};

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await getStoreProduct(slug);
  if (!p) notFound();
  const [settings, related] = await Promise.all([getSettings(), relatedProducts(p.id, p.category_id)]);
  const theme = categoryTheme(p.category_slug);
  const steps = p.how_to_use?.trim() ? p.how_to_use.split(/\n+/).map((s) => s.trim()).filter(Boolean) : DEFAULT_STEPS[theme.kind];
  const about = p.description && p.description.trim() !== p.short_description.trim() ? p.description : null;
  const story = storyFor(theme.kind, p.category_name, p.title);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="mx-auto max-w-7xl px-4 pt-6 text-sm text-neutral-500 sm:px-6" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-ink">Products</Link>
        {p.category_slug && <> <span className="mx-1.5">/</span> <Link href={`/products?category=${p.category_slug}`} className="hover:text-ink">{p.category_name}</Link></>}
        <span className="mx-1.5">/</span> <span className="text-ink">{p.title}</span>
      </nav>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-12">
        <Gallery images={p.images} title={p.title} tint={theme.tint} />
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase" style={{ color: theme.kind === "cold" ? "#2f6630" : "#6e5a01" }}>{p.category_name}</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight font-semibold sm:text-5xl">{p.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-neutral-600">{p.short_description}</p>
          <div className="mt-8"><VariantPicker title={p.title} variants={p.variants} whatsapp={settings.whatsapp} phone={settings.phone} /></div>
          <ul className="mt-8 grid grid-cols-3 gap-3 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-600">
            <li className="flex flex-col items-center gap-2"><Clock size={22} className="text-brand-600" />Ready in seconds</li>
            <li className="flex flex-col items-center gap-2"><Leaf size={22} className="text-brand-600" />From Assam since 1982</li>
            <li className="flex flex-col items-center gap-2"><ShieldCheck size={22} className="text-brand-600" />FSSAI &amp; ISO certified</li>
          </ul>
        </div>
      </section>

      {/* Details + how to prepare */}
      <section style={{ background: theme.tint }}>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="font-serif text-3xl font-semibold">How to prepare</h2>
            <ol className="mt-8 space-y-6">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white font-serif text-lg font-semibold shadow-sm" style={{ color: theme.deep }}>{i + 1}</span>
                  <p className="pt-2 text-neutral-700">{s}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="divide-y divide-black/10 rounded-3xl bg-white px-6 shadow-sm">
            {[
              { t: "About this product", b: about ?? p.short_description },
              { t: "Pack sizes", b: p.variants.map((v) => v.name).join(", ") },
              p.ingredients?.trim() ? { t: "Ingredients", b: p.ingredients } : null,
              p.shelf_life?.trim() ? { t: "Shelf life", b: p.shelf_life } : null,
              { t: "Storage", b: "Store in a cool, dry place. Close the pack tightly after use." },
            ].filter(Boolean).map((row, i) => (
              <details key={row!.t} open={i === 0} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  {row!.t}<ChevronDown size={18} className="transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-neutral-600">{row!.b}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Write-up */}
      <section className="mx-auto max-w-7xl space-y-20 px-4 py-20 sm:px-6 lg:space-y-28 lg:py-28">
        {story.map((s, i) => (
          <article key={s.title} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <div className={`overflow-hidden rounded-[2rem] ${i % 2 ? "lg:order-2" : ""}`} style={{ background: theme.tint }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className={i % 2 ? "lg:order-1" : ""}>
              <p className="text-sm font-semibold tracking-[0.2em] text-brand-700 uppercase">{s.eyebrow}</p>
              <h2 className="mt-3 font-serif text-3xl leading-tight font-semibold sm:text-4xl">{s.title}</h2>
              <p className="mt-5 text-lg leading-relaxed text-neutral-600">{s.text}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-serif text-3xl font-semibold">You may also like</h2>
              <Link href="/products" className="text-sm font-semibold text-brand-700 hover:underline">All products →</Link>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
              {related.map((r) => <ProductCard key={r.id} p={r} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
