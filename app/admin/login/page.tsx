import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-brand-900 p-12 text-brand-50 lg:flex lg:flex-col lg:justify-between">
        <div className="font-serif text-2xl tracking-[0.3em]">NAUCERA</div>
        <div>
          <h1 className="font-serif text-4xl leading-tight">Every great cup<br />starts with the right mix.</h1>
          <p className="mt-4 max-w-md text-brand-200">Manage your coffee &amp; tea premix catalogue, inventory and orders – all in one place.</p>
        </div>
        <p className="text-sm text-brand-300">Store admin</p>
        <div className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full bg-brand-700/40" />
        <div className="pointer-events-none absolute -right-8 bottom-40 size-40 rounded-full bg-brand-500/30" />
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 font-serif text-2xl tracking-[0.3em] text-brand-900 lg:hidden">NAUCERA</div>
          <h2 className="text-2xl font-semibold">Sign in to your store</h2>
          <p className="mt-1 text-sm text-stone-500">Use your admin email and password.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
