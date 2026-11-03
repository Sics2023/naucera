"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";

export type MenuProduct = { title: string; slug: string; image: string | null; sizes: string | null };
export type MenuCategory = { name: string; slug: string; tint: string; products: MenuProduct[] };

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Products", mega: true },
  { href: "/vending-machines", label: "Vending Machine" },
  { href: "/blog", label: "Blog" },
  { href: "#contact", label: "Contact" },
];

export default function SiteHeader({ logo, storeName, categories }: { logo: string; storeName: string; categories: MenuCategory[] }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mobileProducts, setMobileProducts] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);

  // Close menus after navigating.
  useEffect(() => {
    setMega(false);
    setMobile(false);
  }, [pathname, search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (setMega(false), setMobile(false));
    const onClick = (e: MouseEvent) => megaRef.current && !megaRef.current.contains(e.target as Node) && setMega(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(true);
  };
  const closeMegaSoon = () => {
    closeTimer.current = setTimeout(() => setMega(false), 150);
  };
  const isActive = (href: string) => (href === "/" ? pathname === "/" : !href.startsWith("#") && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-ink from-35% to-olive text-white shadow-sm">
      <div ref={megaRef} onMouseLeave={closeMegaSoon}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:h-20 sm:px-6">
          <Link href="/" aria-label={`${storeName} home`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt={storeName} className="h-8 w-auto sm:h-10" />
          </Link>

          <nav className="hidden items-center gap-6 text-[15px] lg:flex xl:gap-7" aria-label="Main">
            {LINKS.map((l) =>
              l.mega ? (
                <button key={l.href} type="button" onMouseEnter={openMega} onClick={() => setMega((m) => !m)} aria-expanded={mega} aria-haspopup="true"
                  className={`flex cursor-pointer items-center gap-1 transition hover:text-gold ${mega || isActive(l.href) ? "text-gold" : "text-white/90"}`}>
                  {l.label}
                  <ChevronDown size={16} className={`transition ${mega ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <Link key={l.href} href={l.href} onMouseEnter={closeMegaSoon}
                  className={`transition hover:text-gold ${isActive(l.href) ? "text-gold" : "text-white/90"}`}>
                  {l.label}
                </Link>
              )
            )}
            <Link href="/distributors" onMouseEnter={closeMegaSoon}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 ${isActive("/distributors") ? "bg-white text-ink" : "bg-gold text-ink hover:bg-white"}`}>
              Become a Distributor
            </Link>
          </nav>

          <button type="button" onClick={() => setMobile((m) => !m)} aria-label={mobile ? "Close menu" : "Open menu"} aria-expanded={mobile}
            className="cursor-pointer rounded-md p-2 hover:bg-white/10 lg:hidden">
            {mobile ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Desktop mega menu */}
        <div onMouseEnter={openMega}
          className={`absolute inset-x-0 top-full hidden border-t border-black/5 bg-white text-ink shadow-2xl transition duration-200 lg:block ${mega ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}>
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-8" style={{ gridTemplateColumns: `repeat(${Math.max(categories.length, 1)}, minmax(0, 1fr))` }}>
            {categories.map((c) => (
              <div key={c.slug}>
                <Link href={`/products?category=${c.slug}`} className="group flex items-center justify-between border-b border-neutral-200 pb-3">
                  <span className="font-serif text-lg font-semibold">{c.name}</span>
                  <span className="flex items-center gap-1 text-xs font-medium text-brand-700 opacity-70 transition group-hover:opacity-100">
                    View all <ArrowRight size={13} />
                  </span>
                </Link>
                <ul className="mt-3 space-y-1">
                  {c.products.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/products/${p.slug}`} className={`flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-neutral-100 ${pathname === `/products/${p.slug}` ? "bg-neutral-100" : ""}`}>
                        <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg" style={{ background: c.tint }}>
                          {p.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image} alt="" loading="lazy" className="h-full w-full object-contain p-1" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{p.title}</span>
                          {p.sizes && <span className="block truncate text-xs text-neutral-500">{p.sizes}</span>}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-neutral-200 bg-neutral-50">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 text-sm">
              <span className="text-neutral-600">Tea, coffee &amp; cooler premixes – 1 kg packs and single-serve sachets.</span>
              <Link href="/products" className="flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-800">
                View all products <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobile && (
        <nav className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 bg-white text-ink shadow-xl lg:hidden" aria-label="Main">
          <ul className="px-4 py-2">
            {LINKS.map((l) =>
              l.mega ? (
                <li key={l.href} className="border-b border-neutral-100">
                  <button type="button" onClick={() => setMobileProducts((o) => !o)} aria-expanded={mobileProducts}
                    className="flex w-full cursor-pointer items-center justify-between py-3.5 font-medium">
                    {l.label}
                    <ChevronDown size={18} className={`transition ${mobileProducts ? "rotate-180" : ""}`} />
                  </button>
                  {mobileProducts && (
                    <div className="space-y-5 pb-4">
                      {categories.map((c) => (
                        <div key={c.slug}>
                          <Link href={`/products?category=${c.slug}`} className="flex items-center justify-between text-xs font-semibold tracking-wide text-brand-700 uppercase">
                            {c.name} <ArrowRight size={13} />
                          </Link>
                          <ul className="mt-2 grid grid-cols-2 gap-2">
                            {c.products.map((p) => (
                              <li key={p.slug}>
                                <Link href={`/products/${p.slug}`} className="flex items-center gap-2 rounded-lg p-1 hover:bg-neutral-100">
                                  <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-md" style={{ background: c.tint }}>
                                    {p.image && (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={p.image} alt="" className="h-full w-full object-contain p-0.5" />
                                    )}
                                  </span>
                                  <span className="text-sm leading-tight">{p.title}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <Link href="/products" className="flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                        View all products <ArrowRight size={15} />
                      </Link>
                    </div>
                  )}
                </li>
              ) : (
                <li key={l.href} className="border-b border-neutral-100 last:border-0">
                  <Link href={l.href} onClick={() => setMobile(false)} className={`block py-3.5 font-medium ${isActive(l.href) ? "text-brand-700" : ""}`}>{l.label}</Link>
                </li>
              )
            )}
            <li className="py-4">
              <Link href="/distributors" onClick={() => setMobile(false)} className="block rounded-full bg-gold px-5 py-3 text-center font-semibold text-ink">Become a Distributor</Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
