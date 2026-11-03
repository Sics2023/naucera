"use client";

import { useActionState, useRef, useState } from "react";
import { saveProduct } from "@/app/admin/actions";
import type { Category, Product, ProductImage, Variant } from "@/lib/queries";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";

type V = { id?: number; key: string; name: string; sku: string; price: string; compare_at_price: string; stock: string; weight_grams: string };
type Img = { url: string; alt: string };

let k = 0;
const newKey = () => `n${++k}`;
const blank = (name = "", grams = ""): V => ({ key: newKey(), name, sku: "", price: "", compare_at_price: "", stock: "0", weight_grams: grams });

function Section({ title, children, desc }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="font-semibold">{title}</h2>
      {desc && <p className="mt-0.5 text-sm text-stone-500">{desc}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default function ProductForm({ categories, product, variants: initialVariants, images: initialImages }: {
  categories: Category[]; product?: Product; variants?: Variant[]; images?: ProductImage[];
}) {
  const [state, action, pending] = useActionState(saveProduct, undefined);
  const [variants, setVariants] = useState<V[]>(
    initialVariants?.length
      ? initialVariants.map((v) => ({
          id: v.id, key: `v${v.id}`, name: v.name, sku: v.sku, price: String(v.price),
          compare_at_price: v.compare_at_price == null ? "" : String(v.compare_at_price), stock: String(v.stock), weight_grams: String(v.weight_grams || ""),
        }))
      : [blank("250 g", "250"), blank("500 g", "500"), blank("1 kg", "1000")]
  );
  const [images, setImages] = useState<Img[]>(initialImages?.map((i) => ({ url: i.url, alt: i.alt })) ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [drag, setDrag] = useState(false);
  const [title, setTitle] = useState(product?.title ?? "");
  const [seoTitle, setSeoTitle] = useState(product?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(product?.seo_description ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  const setV = (key: string, field: keyof V, value: string) => setVariants((vs) => vs.map((v) => (v.key === key ? { ...v, [field]: value } : v)));

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);
    setUploadError("");
    const fd = new FormData();
    list.forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setImages((im) => [...im, ...json.urls.map((url: string) => ({ url, alt: title }))]);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const move = (i: number, d: number) =>
    setImages((im) => {
      const j = i + d;
      if (j < 0 || j >= im.length) return im;
      const c = [...im];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  return (
    <form action={action} className="pb-24">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      {state?.error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{state.error}</div>}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Section title="Product details">
            <div>
              <label className="label" htmlFor="title">Title</label>
              <input id="title" name="title" className="input" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Masala Chai Premix" />
            </div>
            <div>
              <label className="label" htmlFor="short_description">Short description</label>
              <input id="short_description" name="short_description" className="input" defaultValue={product?.short_description} placeholder="One line shown on product cards" maxLength={200} />
            </div>
            <div>
              <label className="label" htmlFor="description">Full description</label>
              <textarea id="description" name="description" rows={6} className="input" defaultValue={product?.description} placeholder="Taste, aroma, who it’s for…" />
            </div>
          </Section>

          <Section title="Media" desc="Upload product photos. The first image is used as the cover.">
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
              className={`grid grid-cols-3 gap-3 rounded-xl border-2 border-dashed p-3 sm:grid-cols-4 ${drag ? "border-brand-500 bg-brand-50" : "border-stone-200"}`}
            >
              {images.map((img, i) => (
                <div key={img.url + i} className={`group relative aspect-square overflow-hidden rounded-lg border bg-stone-50 ${i === 0 ? "col-span-2 row-span-2 border-brand-300" : "border-stone-200"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute top-2 left-2 rounded bg-brand-900/80 px-1.5 py-0.5 text-[11px] text-white">Cover</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => move(i, -1)} className="rounded bg-white/90 p-1" aria-label="Move left"><ArrowLeft size={14} /></button>
                      <button type="button" onClick={() => move(i, 1)} className="rounded bg-white/90 p-1" aria-label="Move right"><ArrowRight size={14} /></button>
                    </div>
                    <button type="button" onClick={() => setImages((im) => im.filter((_, j) => j !== i))} className="rounded bg-white/90 p-1 text-red-700" aria-label="Remove image"><X size={14} /></button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-lg bg-stone-50 text-center text-xs text-stone-500 hover:bg-stone-100 ${images.length === 0 ? "col-span-3 aspect-auto py-10 sm:col-span-4" : ""}`}>
                {uploading ? <Loader2 className="animate-spin" size={22} /> : <ImagePlus size={22} />}
                <span className="font-medium text-stone-700">{uploading ? "Uploading…" : "Add images"}</span>
                {images.length === 0 && <span>or drag &amp; drop · JPG, PNG, WebP up to 8 MB</span>}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
            {uploadError && <p className="text-sm text-red-700">{uploadError}</p>}
          </Section>

          <Section title="Variants & pricing" desc="Pack sizes with their own price, SKU and stock.">
            <div className="-mx-5 overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead><tr className="border-y border-stone-100 bg-stone-50/60">
                  <th className="th pl-5">Pack size</th><th className="th">SKU</th><th className="th">Price ₹</th><th className="th">Compare-at ₹</th><th className="th">Stock</th><th className="th">Weight g</th><th className="th" />
                </tr></thead>
                <tbody className="divide-y divide-stone-100">
                  {variants.map((v) => (
                    <tr key={v.key}>
                      <td className="py-2 pr-2 pl-5"><input className="input" value={v.name} onChange={(e) => setV(v.key, "name", e.target.value)} placeholder="500 g" aria-label="Pack size" /></td>
                      <td className="p-2"><input className="input" value={v.sku} onChange={(e) => setV(v.key, "sku", e.target.value)} placeholder="NC-MC-500" aria-label="SKU" /></td>
                      <td className="p-2"><input className="input w-24" type="number" min="0" step="0.01" value={v.price} onChange={(e) => setV(v.key, "price", e.target.value)} aria-label="Price" required /></td>
                      <td className="p-2"><input className="input w-24" type="number" min="0" step="0.01" value={v.compare_at_price} onChange={(e) => setV(v.key, "compare_at_price", e.target.value)} aria-label="Compare-at price" placeholder="MRP" /></td>
                      <td className="p-2"><input className="input w-20" type="number" min="0" step="1" value={v.stock} onChange={(e) => setV(v.key, "stock", e.target.value)} aria-label="Stock" /></td>
                      <td className="p-2"><input className="input w-20" type="number" min="0" step="1" value={v.weight_grams} onChange={(e) => setV(v.key, "weight_grams", e.target.value)} aria-label="Weight in grams" /></td>
                      <td className="p-2 pr-5">
                        <button type="button" onClick={() => setVariants((vs) => vs.filter((x) => x.key !== v.key))} disabled={variants.length === 1} className="rounded p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-700 disabled:opacity-30" aria-label="Remove variant"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn-secondary" onClick={() => setVariants((vs) => [...vs, blank()])}><Plus size={15} /> Add variant</button>
              <span className="text-xs text-stone-500">Quick add:</span>
              {[["100 g", "100"], ["250 g", "250"], ["500 g", "500"], ["1 kg", "1000"], ["5 kg", "5000"]].map(([n, g]) => (
                <button key={n} type="button" className="rounded-full border border-stone-200 px-2.5 py-1 text-xs hover:bg-stone-50" onClick={() => setVariants((vs) => [...vs, blank(n, g)])}>{n}</button>
              ))}
            </div>
          </Section>

          <Section title="Product information" desc="Shown on the product page.">
            <div>
              <label className="label" htmlFor="ingredients">Ingredients</label>
              <textarea id="ingredients" name="ingredients" rows={2} className="input" defaultValue={product?.ingredients} />
            </div>
            <div>
              <label className="label" htmlFor="how_to_use">How to prepare</label>
              <textarea id="how_to_use" name="how_to_use" rows={2} className="input" defaultValue={product?.how_to_use ?? "Add 2 heaped teaspoons (approx. 18 g) to 150 ml of hot water. Stir well and enjoy."} />
            </div>
            <div>
              <label className="label" htmlFor="shelf_life">Shelf life</label>
              <input id="shelf_life" name="shelf_life" className="input" defaultValue={product?.shelf_life ?? "9 months from date of manufacture"} />
            </div>
          </Section>

          <Section title="Search engine listing" desc="How this product appears on Google.">
            <div className="rounded-lg bg-stone-50 p-3">
              <div className="text-xs text-emerald-800">naucera.in › products › {product?.slug ?? "…"}</div>
              <div className="truncate text-lg text-blue-800">{seoTitle || (title ? `${title} | Naucera` : "Product title | Naucera")}</div>
              <div className="line-clamp-2 text-sm text-stone-600">{seoDesc || "Add a meta description to improve how this page shows in search results."}</div>
            </div>
            <div>
              <label className="label" htmlFor="seo_title">Page title</label>
              <input id="seo_title" name="seo_title" className="input" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} />
              <p className="hint">{seoTitle.length}/70 characters</p>
            </div>
            <div>
              <label className="label" htmlFor="seo_description">Meta description</label>
              <textarea id="seo_description" name="seo_description" rows={2} className="input" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} maxLength={160} />
              <p className="hint">{seoDesc.length}/160 characters</p>
            </div>
            <div>
              <label className="label" htmlFor="slug">URL handle</label>
              <input id="slug" name="slug" className="input" defaultValue={product?.slug} placeholder="auto-generated from title" />
            </div>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Status">
            <select name="status" className="input" defaultValue={product?.status ?? "active"}>
              <option value="active">Active – visible in store</option>
              <option value="draft">Draft – hidden</option>
              <option value="archived">Archived</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="featured" defaultChecked={!!product?.featured} className="size-4 accent-brand-700" />
              Feature on homepage
            </label>
          </Section>
          <Section title="Organisation">
            <div>
              <label className="label" htmlFor="category_id">Category</label>
              <select id="category_id" name="category_id" className="input" defaultValue={product?.category_id ?? ""}>
                <option value="">Uncategorised</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="tags">Tags</label>
              <input id="tags" name="tags" className="input" defaultValue={product?.tags} placeholder="chai, bestseller, winter" />
              <p className="hint">Separate with commas.</p>
            </div>
          </Section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white/95 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-4 py-3 lg:px-8">
          <span className="mr-auto hidden text-sm text-stone-500 sm:block">{product ? "Editing product" : "New product"}</span>
          <a href="/admin/products" className="btn-secondary">Cancel</a>
          <button className="btn-primary min-w-28" disabled={pending || uploading}>{pending ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : "Save product"}</button>
        </div>
      </div>
    </form>
  );
}
