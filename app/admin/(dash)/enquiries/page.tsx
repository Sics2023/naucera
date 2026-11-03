import { all } from "@/lib/db";
import { fmtDateTime } from "@/lib/format";
import { Badge, Empty, PageHeader } from "@/components/ui";
import ConfirmButton from "@/components/ConfirmButton";
import { deleteEnquiry, setEnquiryStatus } from "../../actions";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Enquiries" };

type Row = { id: number; kind: string; name: string; phone: string; email: string; address: string; message: string | null; status: string; created_at: string };

const FILTERS = ["all", "new", "contacted", "closed"];

export default async function Enquiries({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = FILTERS.includes(status ?? "") && status !== "all" ? status : undefined;
  const rows = await all<Row>(`SELECT * FROM enquiries ${filter ? "WHERE status = ?" : ""} ORDER BY created_at DESC LIMIT 500`, ...(filter ? [filter] : []));

  return (
    <>
      <PageHeader title="Enquiries" subtitle="Submissions from the “Become a Distributor” form on the website." />
      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <Link key={f} href={f === "all" ? "/admin/enquiries" : `/admin/enquiries?status=${f}`}
            className={`rounded-full border px-3.5 py-1.5 text-sm capitalize ${(filter ?? "all") === f ? "border-ink bg-ink text-white" : "border-neutral-300 bg-white hover:border-ink"}`}>
            {f}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="card"><Empty title="No enquiries yet">New distributor enquiries from the website will appear here.</Empty></div>
      ) : (
        <div className="space-y-3">
          {rows.map((e) => {
            const wa = e.phone.replace(/\D/g, "");
            return (
              <article key={e.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">{e.name}</h2>
                      <Badge tone={e.status} />
                      <span className="text-xs text-neutral-500 capitalize">{e.kind}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-500">{fmtDateTime(e.created_at)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={setEnquiryStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={e.id} />
                      <select name="status" defaultValue={e.status} className="input w-auto py-1.5">
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button className="btn-secondary py-1.5">Update</button>
                    </form>
                    <form action={deleteEnquiry}>
                      <input type="hidden" name="id" value={e.id} />
                      <ConfirmButton message={`Delete the enquiry from ${e.name}?`}>Delete</ConfirmButton>
                    </form>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-neutral-700 sm:grid-cols-2">
                  {e.phone && (
                    <p className="flex items-center gap-2">
                      <Phone size={15} className="text-neutral-400" /><a href={`tel:${e.phone}`} className="hover:underline">{e.phone}</a>
                      {wa.length >= 10 && <a href={`https://wa.me/${wa.length === 10 ? "91" + wa : wa}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-700 hover:underline"><MessageCircle size={14} /> WhatsApp</a>}
                    </p>
                  )}
                  {e.email && <p className="flex items-center gap-2"><Mail size={15} className="text-neutral-400" /><a href={`mailto:${e.email}`} className="hover:underline">{e.email}</a></p>}
                  {e.address && <p className="flex items-start gap-2 sm:col-span-2"><MapPin size={15} className="mt-0.5 shrink-0 text-neutral-400" />{e.address}</p>}
                </div>
                {e.message && <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm whitespace-pre-line text-neutral-700">{e.message}</p>}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
