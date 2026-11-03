import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function PageHeader({ title, subtitle, back, children }: { title: string; subtitle?: string; back?: { href: string; label: string }; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {back && <Link href={back.href} className="mb-1 inline-block text-sm text-neutral-500 hover:text-neutral-800">← {back.label}</Link>}
        <h1 className="font-serif text-2xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

const TONES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  draft: "bg-neutral-100 text-neutral-600 ring-neutral-500/20",
  archived: "bg-neutral-100 text-neutral-500 ring-neutral-500/20",
  pending: "bg-amber-50 text-amber-800 ring-amber-600/25",
  processing: "bg-sky-50 text-sky-700 ring-sky-600/20",
  shipped: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  cancelled: "bg-red-50 text-red-700 ring-red-600/20",
  new: "bg-amber-50 text-amber-800 ring-amber-600/25",
  contacted: "bg-sky-50 text-sky-700 ring-sky-600/20",
  closed: "bg-neutral-100 text-neutral-600 ring-neutral-500/20",
  refunded: "bg-red-50 text-red-700 ring-red-600/20",
  low: "bg-amber-50 text-amber-800 ring-amber-600/25",
  out: "bg-red-50 text-red-700 ring-red-600/20",
};

export function Badge({ tone, children }: { tone: string; children?: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${TONES[tone] ?? TONES.draft}`}>
      {children ?? tone}
    </span>
  );
}

export function Flash({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
      <CheckCircle2 size={16} /> {children}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="font-medium text-neutral-800">{title}</p>
      {children && <div className="mt-1 text-sm text-neutral-500">{children}</div>}
    </div>
  );
}

export function Thumb({ src, alt, size = 40 }: { src: string | null; alt: string; size?: number }) {
  return (
    <div className="shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50" style={{ width: size, height: size }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-contain" />
      ) : (
        <div className="grid h-full w-full place-items-center text-[10px] text-neutral-400">No image</div>
      )}
    </div>
  );
}
