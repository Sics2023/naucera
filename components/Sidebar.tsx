"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, ShoppingBag, Package, Boxes, Tags, Users, Settings, Menu, X, Store } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Home", icon: Home, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ storeName, openOrders }: { storeName: string; openOrders: number }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed top-3 left-3 z-30 rounded-lg border border-neutral-200 bg-white p-1.5 lg:hidden" aria-label="Open menu">
        <Menu size={20} />
      </button>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-night text-white/80 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-14 items-center justify-between px-5">
          <Link href="/admin" aria-label={storeName}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/naucera-logo.png" alt={storeName} className="h-7 w-auto" />
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden" aria-label="Close menu"><X size={18} /></button>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-3">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? path === href : path.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-white/10 font-medium text-white shadow-[inset_3px_0_0_var(--color-brand-500)]" : "text-white/70 hover:bg-white/5 hover:text-white"}`}>
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                <span className="flex-1">{label}</span>
                {label === "Orders" && openOrders > 0 && (
                  <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-semibold text-night">{openOrders}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <a href="/products" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">
            <Store size={18} /> <span className="flex-1">View store</span><span className="text-xs text-gold">↗</span>
          </a>
        </div>
      </aside>
    </>
  );
}
