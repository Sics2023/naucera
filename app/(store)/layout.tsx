import Link from "next/link";
import { getSettings } from "@/lib/queries";
import { listStoreCategories } from "@/lib/store";
import { Menu, Phone, MapPin, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), listStoreCategories()]);
  const nav = [{ href: "/products", label: "All Products" }, ...categories.map((c) => ({ href: `/products?category=${c.slug}`, label: c.name }))];

  return (
    <div className="flex min-h-screen flex-col bg-white font-body text-ink">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-ink from-35% to-olive text-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:h-20 sm:px-6">
          <Link href="/products" aria-label={`${settings.store_name || "Naucera"} home`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/naucera-logo.png" alt={settings.store_name || "Naucera"} className="h-8 w-auto sm:h-10" />
          </Link>
          <nav className="hidden items-center gap-7 text-[15px] lg:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-white/90 transition hover:text-gold">{n.label}</Link>
            ))}
            <a href="#contact" className="text-white/90 transition hover:text-gold">Contact</a>
          </nav>
          <details className="relative lg:hidden">
            <summary className="flex cursor-pointer list-none items-center rounded-md p-2 hover:bg-white/10" aria-label="Menu"><Menu size={22} /></summary>
            <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl bg-white py-2 text-ink shadow-xl">
              {nav.map((n) => <Link key={n.href} href={n.href} className="block px-4 py-2.5 hover:bg-neutral-100">{n.label}</Link>)}
              <a href="#contact" className="block px-4 py-2.5 hover:bg-neutral-100">Contact</a>
            </div>
          </details>
        </div>
      </header>

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
