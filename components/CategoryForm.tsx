"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveCategory } from "@/app/admin/actions";
import type { Category } from "@/lib/queries";

export default function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionState(saveCategory, undefined);
  return (
    <form action={action} className="mt-4 space-y-4">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" className="input" required defaultValue={category?.name} placeholder="e.g. Green Tea" /></div>
      <div><label className="label" htmlFor="slug">Handle</label><input id="slug" name="slug" className="input" defaultValue={category?.slug} placeholder="auto-generated" /></div>
      <div><label className="label" htmlFor="description">Description</label><textarea id="description" name="description" rows={3} className="input" defaultValue={category?.description} /></div>
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <div className="flex gap-2">
        <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : category ? "Save changes" : "Add category"}</button>
        {category && <Link href="/admin/categories" className="btn-secondary">Cancel</Link>}
      </div>
    </form>
  );
}
