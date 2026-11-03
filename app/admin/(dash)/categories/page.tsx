import Link from "next/link";
import { listCategories } from "@/lib/queries";
import { Flash, PageHeader } from "@/components/ui";
import CategoryForm from "@/components/CategoryForm";
import ConfirmButton from "@/components/ConfirmButton";
import { deleteCategory } from "../../actions";

export const metadata = { title: "Categories" };

export default async function Categories({ searchParams }: { searchParams: Promise<{ edit?: string; saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const cats = await listCategories();
  const editing = sp.edit ? cats.find((c) => c.id === Number(sp.edit)) : undefined;
  return (
    <>
      <PageHeader title="Categories" subtitle="Group products into collections like Coffee, Tea and Vending." />
      <Flash show={sp.saved === "1"}>Category saved.</Flash>
      <Flash show={sp.deleted === "1"}>Category deleted. Its products are now uncategorised.</Flash>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-2">
          <table className="w-full">
            <thead className="bg-neutral-50/60"><tr><th className="th">Name</th><th className="th">Handle</th><th className="th">Products</th><th className="th" /></tr></thead>
            <tbody className="divide-y divide-neutral-100">
              {cats.map((c) => (
                <tr key={c.id} className={editing?.id === c.id ? "bg-brand-50" : "hover:bg-neutral-50"}>
                  <td className="td"><div className="font-medium">{c.name}</div><div className="text-xs text-neutral-500">{c.description}</div></td>
                  <td className="td font-mono text-xs text-neutral-600">/{c.slug}</td>
                  <td className="td"><Link href={`/admin/products?category=${c.id}`} className="text-brand-700 hover:underline">{c.product_count}</Link></td>
                  <td className="td">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/categories?edit=${c.id}`} className="btn-secondary px-2.5 py-1.5 text-xs">Edit</Link>
                      <form action={deleteCategory}><input type="hidden" name="id" value={c.id} /><ConfirmButton message={`Delete “${c.name}”? Products in it will become uncategorised.`}>Delete</ConfirmButton></form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold">{editing ? `Edit “${editing.name}”` : "New category"}</h2>
          <CategoryForm key={editing?.id ?? "new"} category={editing} />
        </div>
      </div>
    </>
  );
}
