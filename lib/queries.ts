import "server-only";
import { all, get } from "./db";

export type Category = { id: number; name: string; slug: string; description: string; sort: number; product_count?: number };
export type Variant = {
  id: number; product_id: number; name: string; sku: string; price: number;
  compare_at_price: number | null; stock: number; weight_grams: number; position: number;
};
export type ProductImage = { id: number; product_id: number; url: string; alt: string; position: number };
export type Product = {
  id: number; title: string; slug: string; short_description: string; description: string;
  category_id: number | null; status: "active" | "draft" | "archived"; tags: string; featured: number;
  ingredients: string; how_to_use: string; shelf_life: string; seo_title: string; seo_description: string;
  created_at: string; updated_at: string;
};
export type ProductRow = Product & {
  category_name: string | null; image: string | null; variant_count: number;
  total_stock: number; min_price: number | null; max_price: number | null;
};
export type Order = {
  id: number; number: string; customer_id: number | null; status: string; payment_status: string;
  payment_method: string; subtotal: number; shipping: number; discount: number; total: number;
  shipping_address: string; notes: string; created_at: string;
};

export function getSettings(): Record<string, string> {
  const rows = all<{ key: string; value: string }>("SELECT key, value FROM settings");
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export function listCategories(): Category[] {
  return all<Category>(
    `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
     FROM categories c ORDER BY c.sort, c.name`
  );
}

export function listProducts(f: { q?: string; category?: string; status?: string; stock?: string } = {}): ProductRow[] {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (f.q) {
    where.push("(p.title LIKE ? OR p.tags LIKE ? OR EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.sku LIKE ?))");
    params.push(`%${f.q}%`, `%${f.q}%`, `%${f.q}%`);
  }
  if (f.category) { where.push("p.category_id = ?"); params.push(Number(f.category)); }
  if (f.status) { where.push("p.status = ?"); params.push(f.status); }
  const rows = all<ProductRow>(
    `SELECT p.*, c.name AS category_name,
       (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY position, id LIMIT 1) AS image,
       (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id) AS variant_count,
       (SELECT COALESCE(SUM(stock),0) FROM product_variants v WHERE v.product_id = p.id) AS total_stock,
       (SELECT MIN(price) FROM product_variants v WHERE v.product_id = p.id) AS min_price,
       (SELECT MAX(price) FROM product_variants v WHERE v.product_id = p.id) AS max_price
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     ${where.length ? "WHERE " + where.join(" AND ") : ""}
     ORDER BY p.updated_at DESC, p.id DESC`,
    ...params
  );
  if (f.stock === "out") return rows.filter((r) => r.total_stock <= 0);
  if (f.stock === "low") {
    const t = Number(getSettings().low_stock_threshold || 10);
    return rows.filter((r) => r.total_stock > 0 && r.total_stock <= t * r.variant_count);
  }
  return rows;
}

export function getProduct(id: number) {
  const product = get<Product>("SELECT * FROM products WHERE id = ?", id);
  if (!product) return null;
  const variants = all<Variant>("SELECT * FROM product_variants WHERE product_id = ? ORDER BY position, id", id);
  const images = all<ProductImage>("SELECT * FROM product_images WHERE product_id = ? ORDER BY position, id", id);
  return { product, variants, images };
}
