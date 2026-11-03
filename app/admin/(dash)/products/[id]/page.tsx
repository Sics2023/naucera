import { notFound } from "next/navigation";
import { all } from "@/lib/db";
import { getProduct, listCategories } from "@/lib/queries";
import { inr } from "@/lib/format";
import { Badge, Flash, PageHeader } from "@/components/ui";
import ProductForm from "@/components/ProductForm";
import { deleteProduct, duplicateProduct } from "../../../actions";
import { Copy } from "lucide-react";
import ConfirmButton from "@/components/ConfirmButton";

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const data = await getProduct(Number(id));
  if (!data) notFound();
  const sales = (await all<{ units: number; revenue: number }>(
    `SELECT COALESCE(SUM(oi.qty),0) AS units, COALESCE(SUM(oi.qty*oi.price),0) AS revenue FROM order_items oi
     JOIN orders o ON o.id = oi.order_id WHERE oi.product_id = ? AND o.status != 'cancelled'`, Number(id)
  ))[0];

  return (
    <>
      <PageHeader title={data.product.title} subtitle={`${sales.units} units sold · ${inr(Math.round(sales.revenue))} lifetime sales`} back={{ href: "/admin/products", label: "Products" }}>
        <Badge tone={data.product.status} />
        {data.product.status === "active" && <a href={`/products/${data.product.slug}`} target="_blank" rel="noopener" className="btn-secondary">View in store ↗</a>}
        <form action={duplicateProduct}><input type="hidden" name="id" value={id} /><button className="btn-secondary"><Copy size={15} /> Duplicate</button></form>
        <form action={deleteProduct}><input type="hidden" name="id" value={id} /><ConfirmButton message="Delete this product permanently? Past orders keep their line items.">Delete</ConfirmButton></form>
      </PageHeader>
      <Flash show={saved === "1"}>Product saved.</Flash>
      <ProductForm key={data.product.updated_at} categories={await listCategories()} {...data} />
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const data = await getProduct(Number((await params).id));
  return { title: data?.product.title ?? "Product" };
}
