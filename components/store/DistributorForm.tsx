"use client";

import { useActionState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { submitDistributorEnquiry, type EnquiryState } from "@/app/(store)/actions";

/** Input with a floating label (fields from naucera.in/distributors). */
function Field({ name, label, type = "text", required, area, defaultValue, autoComplete }: {
  name: string; label: string; type?: string; required?: boolean; area?: boolean; defaultValue?: string; autoComplete?: string;
}) {
  const cls = "peer w-full rounded-2xl border border-white/15 bg-white/[0.06] px-5 pt-7 pb-3 text-white outline-none transition placeholder:text-transparent focus:border-gold focus:bg-white/[0.1] focus:ring-4 focus:ring-gold/15";
  return (
    <label className="relative block">
      {area ? (
        <textarea name={name} rows={4} placeholder={label} defaultValue={defaultValue} className={`${cls} resize-none`} />
      ) : (
        <input name={name} type={type} required={required} placeholder={label} defaultValue={defaultValue} autoComplete={autoComplete} className={cls} />
      )}
      <span className="pointer-events-none absolute top-2.5 left-5 text-xs font-medium tracking-wide text-white/55 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-focus:top-2.5 peer-focus:text-xs peer-focus:font-medium peer-focus:text-gold">
        {label}{required && <span className="text-gold"> *</span>}
      </span>
    </label>
  );
}

export default function DistributorForm() {
  const [state, action, pending] = useActionState<EnquiryState, FormData>(submitDistributorEnquiry, undefined);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center rounded-[2rem] border border-gold/30 bg-white/[0.06] p-10 text-center">
        <CheckCircle2 size={48} className="text-gold" />
        <p className="mt-5 font-serif text-3xl font-semibold">Thank you!</p>
        <p className="mt-3 max-w-sm text-white/75">Your enquiry has reached the Naucera team. We’ll call you shortly to talk about the right distributor plan for your area.</p>
      </div>
    );
  }

  const f = state?.fields ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Name" required defaultValue={f.name} autoComplete="name" />
        <Field name="phone" label="Phone Number" type="tel" required defaultValue={f.phone} autoComplete="tel" />
      </div>
      <Field name="email" label="Email" type="email" defaultValue={f.email} autoComplete="email" />
      <Field name="address" label="Address" required defaultValue={f.address} autoComplete="street-address" />
      <Field name="message" label="Message" area defaultValue={f.message} />
      {/* Honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      {state?.error && <p role="alert" className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-100">{state.error}</p>}
      <button type="submit" disabled={pending}
        className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-white disabled:opacity-60">
        {pending ? <Loader2 size={18} className="animate-spin" /> : <>Submit enquiry <ArrowRight size={18} className="transition group-hover:translate-x-1" /></>}
      </button>
      <p className="text-center text-xs text-white/50">We’ll only use your details to contact you about becoming a Naucera distributor.</p>
    </form>
  );
}
