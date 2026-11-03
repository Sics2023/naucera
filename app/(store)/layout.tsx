import Link from "next/link";
import { getSettings } from "@/lib/queries";
import { categoryTheme, listStoreCategories, listStoreProducts } from "@/lib/store";
import SiteHeader, { type MenuCategory } from "@/components/store/SiteHeader";
import Motion from "@/components/store/Motion";
import { Phone, MapPin, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories, products] = await Promise.all([getSettings(), listStoreCategories(), listStoreProducts()]);
  // Products mega menu: one column per category, each product with its cover thumbnail.
  const menu: MenuCategory[] = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    tint: categoryTheme(c.slug).tint,
    products: products.filter((p) => p.category_slug === c.slug).map((p) => ({ title: p.title, slug: p.slug, image: p.image, sizes: p.sizes })),
  }));

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white font-body text-ink">
      <Motion />
      <SiteHeader logo="/naucera-logo.png" storeName={settings.store_name || "Naucera"} categories={menu} />

      <main className="flex-1">{children}</main>

      <footer id="contact" className="bg-night text-white/80">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/naucera-logo.png" alt="Naucera" className="h-10 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
              {settings.tagline || "Tea, Coffee & Cooler Premixes"} – from Vardhman Foods &amp; Beverages, Assam, since 1982.
            </p>
            <p className="mt-4 text-xs tracking-wide text-white/50 uppercase">FSSAI &amp; ISO certified</p>
          </div>
          <div>
            <h3 className="font-serif text-lg text-white">Our Premixes</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.id}><Link href={`/products?category=${c.slug}`} className="hover:text-gold">{c.name}</Link></li>
              ))}
              <li><Link href="/products" className="hover:text-gold">All products</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-lg text-white">Reach Us</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {settings.phone && <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0 text-brand-400" /><a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-gold">{settings.phone}</a></li>}
              {settings.email && <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0 text-brand-400" /><a href={`mailto:${settings.email}`} className="hover:text-gold">{settings.email}</a></li>}
              {settings.address && <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-brand-400" /><span className="whitespace-pre-line">{settings.address}</span></li>}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Vardhman Foods &amp; Beverages. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
