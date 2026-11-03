import { getSettings } from "@/lib/queries";
import { Flash, PageHeader } from "@/components/ui";
import { saveSettings } from "../../actions";

export const metadata = { title: "Settings" };

function Field({ name, label, value, hint, type = "text", prefix }: { name: string; label: string; value?: string; hint?: string; type?: string; prefix?: string }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <div className="flex">
        {prefix && <span className="inline-flex items-center rounded-l-lg border border-r-0 border-neutral-300 bg-neutral-50 px-3 text-sm text-neutral-500">{prefix}</span>}
        <input id={name} name={name} type={type} defaultValue={value} className={`input ${prefix ? "rounded-l-none" : ""}`} />
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Settings" subtitle="Store details, shipping and inventory preferences." />
      <Flash show={saved === "1"}>Settings saved.</Flash>
      <form action={saveSettings} className="max-w-3xl space-y-4">
        <section className="card grid gap-4 p-5 sm:grid-cols-2">
          <h2 className="font-semibold sm:col-span-2">Store details</h2>
          <Field name="store_name" label="Store name" value={s.store_name} />
          <Field name="tagline" label="Tagline" value={s.tagline} />
          <Field name="email" label="Contact email" type="email" value={s.email} />
          <Field name="phone" label="Contact phone" value={s.phone} />
          <Field name="whatsapp" label="WhatsApp number" value={s.whatsapp} hint="With country code, digits only – e.g. 919127064580. Used for the “Enquire on WhatsApp” button." />
          <div className="sm:col-span-2">
            <label className="label" htmlFor="address">Business address</label>
            <textarea id="address" name="address" rows={3} defaultValue={s.address} className="input" />
          </div>
          <Field name="gstin" label="GSTIN" value={s.gstin} hint="Printed on invoices." />
        </section>
        <section className="card grid gap-4 p-5 sm:grid-cols-2">
          <h2 className="font-semibold sm:col-span-2">Shipping</h2>
          <Field name="shipping_flat" label="Flat shipping rate" type="number" prefix="₹" value={s.shipping_flat} />
          <Field name="free_shipping_threshold" label="Free shipping above" type="number" prefix="₹" value={s.free_shipping_threshold} hint="Set 0 to always charge shipping." />
        </section>
        <section className="card grid gap-4 p-5 sm:grid-cols-2">
          <h2 className="font-semibold sm:col-span-2">Inventory</h2>
          <Field name="low_stock_threshold" label="Low-stock alert at" type="number" value={s.low_stock_threshold} hint="Variants at or below this many units are flagged." />
        </section>
        <div className="flex justify-end"><button className="btn-primary">Save settings</button></div>
      </form>
    </>
  );
}
