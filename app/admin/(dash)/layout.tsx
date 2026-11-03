import { requireAdmin } from "@/lib/auth";
import { get } from "@/lib/db";
import { getSettings } from "@/lib/queries";
import Sidebar from "@/components/Sidebar";
import { logout } from "../actions";
import { LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const settings = getSettings();
  const pending = get<{ n: number }>("SELECT COUNT(*) AS n FROM orders WHERE status IN ('pending','processing')")?.n ?? 0;
  return (
    <div className="min-h-screen lg:pl-60">
      <Sidebar storeName={settings.store_name || "Naucera"} openOrders={pending} />
      <header className="sticky top-0 z-20 flex h-14 items-center justify-end gap-3 border-b border-stone-200 bg-white/90 px-4 backdrop-blur lg:px-8">
        <span className="mr-auto pl-10 font-serif tracking-[0.25em] text-brand-900 lg:hidden">{(settings.store_name || "Naucera").toUpperCase()}</span>
        <div className="hidden text-right text-xs leading-tight sm:block">
          <div className="font-medium text-stone-800">Store admin</div>
          <div className="text-stone-500">{session.email}</div>
        </div>
        <div className="grid size-8 place-items-center rounded-full bg-brand-700 text-sm font-semibold text-white">
          {session.email[0]?.toUpperCase()}
        </div>
        <form action={logout}>
          <button className="btn-secondary px-2.5" title="Sign out"><LogOut size={16} /><span className="hidden sm:inline">Sign out</span></button>
        </form>
      </header>
      <main className="mx-auto max-w-7xl p-4 pt-6 lg:p-8">{children}</main>
    </div>
  );
}
