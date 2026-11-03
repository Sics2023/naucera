import { all } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import OrderForm, { type PickerProduct, type PickerCustomer } from "@/components/OrderForm";

export const metadata = { title: "Create order" };

export default async function NewOrder() {
  const [rows, customers] = await Promise.all([
    all<{ product_id: number; title: string; status: string; image: string | null; variant_id: number; name: string; sku: string; price: number; stock: number }>(
      `SELECT p.id AS product_id, p.title, p.status,
         (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY position, id LIMIT 1) AS image,
         v.id AS variant_id, v.name, v.sku, v.price, v.stock
       FROM products p JOIN product_variants v ON v.product_id = p.id
       WHERE p.status != 'archived'
       ORDER BY p.title, v.position, v.id`
    ),
    all<PickerCustomer>("SELECT id, name, email, phone, city, state FROM customers ORDER BY name LIMIT 1000"),
  ]);

  const products: PickerProduct[] = [];
  for (const r of rows) {
    let p = products.find((x) => x.id === r.product_id);
    if (!p) products.push((p = { id: r.product_id, title: r.title, draft: r.status !== "active", image: r.image, variants: [] }));
    p.variants.push({ id: r.variant_id, name: r.name, sku: r.sku, price: Number(r.price), stock: Number(r.stock) });
  }

  // Default order date: now, in India time, formatted for <input type="datetime-local">.
  const now = new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 16);

  return (
    <>
      <PageHeader title="Create order" subtitle="Record an order taken by phone, WhatsApp, in person or from a distributor." back={{ href: "/admin/orders", label: "Orders" }} />
      <OrderForm products={products} customers={customers.map((c) => ({ ...c }))} now={now} />
    </>
  );
}
