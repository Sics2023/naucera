import "server-only";
import { all, get } from "./db";

export type StoreCard = {
  id: number; title: string; slug: string; short_description: string; featured: number;
  category_name: string | null; category_slug: string | null;
  image: string | null; min_price: number | null; max_price: number | null; sizes: string | null;
};

export type StoreCategory = { id: number; name: string; slug: string; description: string; count: number };

export type StoreVariant = { id: number; name: string; price: number; compare_at_price: number | null; stock: number };

export type StoreProduct = {
  id: number; title: string; slug: string; short_description: string; description: string | null;
  ingredients: string | null; how_to_use: string | null; shelf_life: string | null;
  seo_title: string; seo_description: string; category_id: number | null;
  category_name: string | null; category_slug: string | null;
  images: { url: string; alt: string }[]; variants: StoreVariant[];
};

const CARD_SELECT = `
  SELECT p.id, p.title, p.slug, p.short_description, p.featured, c.name AS category_name, c.slug AS category_slug,
    (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY position, id LIMIT 1) AS image,
    (SELECT MIN(price) FROM product_variants v WHERE v.product_id = p.id AND v.price > 0) AS min_price,
    (SELECT MAX(price) FROM product_variants v WHERE v.product_id = p.id AND v.price > 0) AS max_price,
    (SELECT GROUP_CONCAT(name ORDER BY position SEPARATOR ' · ') FROM product_variants v WHERE v.product_id = p.id) AS sizes
  FROM products p LEFT JOIN categories c ON c.id = p.category_id
  WHERE p.status = 'active'`;

export async function listStoreCategories(): Promise<StoreCategory[]> {
  return all<StoreCategory>(
    `SELECT c.id, c.name, c.slug, c.description,
       (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'active') AS count
     FROM categories c
     WHERE EXISTS (SELECT 1 FROM products p WHERE p.category_id = c.id AND p.status = 'active')
     ORDER BY c.sort, c.name`
  );
}

export async function listStoreProducts(categorySlug?: string): Promise<StoreCard[]> {
  return categorySlug
    ? all<StoreCard>(`${CARD_SELECT} AND c.slug = ? ORDER BY p.featured DESC, p.id`, categorySlug)
    : all<StoreCard>(`${CARD_SELECT} ORDER BY c.sort, p.featured DESC, p.id`);
}

export async function relatedProducts(productId: number, categoryId: number | null, limit = 4): Promise<StoreCard[]> {
  const same = categoryId
    ? await all<StoreCard>(`${CARD_SELECT} AND p.category_id = ? AND p.id != ? ORDER BY p.featured DESC, RAND() LIMIT ${limit}`, categoryId, productId)
    : [];
  if (same.length >= limit) return same;
  const more = await all<StoreCard>(
    `${CARD_SELECT} AND p.id != ? ${same.length ? `AND p.id NOT IN (${same.map(() => "?").join(",")})` : ""} ORDER BY p.featured DESC, RAND() LIMIT ${limit - same.length}`,
    productId, ...same.map((s) => s.id)
  );
  return [...same, ...more];
}

export async function getStoreProduct(slug: string): Promise<StoreProduct | null> {
  const p = await get<Omit<StoreProduct, "images" | "variants">>(
    `SELECT p.id, p.title, p.slug, p.short_description, p.description, p.ingredients, p.how_to_use, p.shelf_life,
       p.seo_title, p.seo_description, p.category_id, c.name AS category_name, c.slug AS category_slug
     FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.slug = ? AND p.status = 'active'`,
    slug
  );
  if (!p) return null;
  const [images, variants] = await Promise.all([
    all<{ url: string; alt: string }>("SELECT url, alt FROM product_images WHERE product_id = ? ORDER BY position, id", p.id),
    all<StoreVariant>("SELECT id, name, price, compare_at_price, stock FROM product_variants WHERE product_id = ? ORDER BY position, id", p.id),
  ]);
  return { ...p, images, variants };
}

/** Visual theme per category (soft tint behind product photos, like a coloured shelf). */
export function categoryTheme(slug: string | null) {
  if (slug?.includes("cooler")) return { tint: "#e6f2ee", deep: "#0f3b33", kind: "cold" as const, label: "Cooler" };
  if (slug?.includes("coffee")) return { tint: "#f1e9e2", deep: "#3b2418", kind: "hot" as const, label: "Coffee" };
  return { tint: "#f4eedc", deep: "#3d3305", kind: "hot" as const, label: "Tea" };
}

export function priceLabel(min: number | null, max: number | null) {
  const f = (n: number) => "₹" + Number(n).toLocaleString("en-IN");
  if (!min) return null;
  return min === max ? f(min) : `From ${f(min)}`;
}

export function whatsappLink(number: string | undefined, text: string) {
  const digits = (number || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : null;
}
