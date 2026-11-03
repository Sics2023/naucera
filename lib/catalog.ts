import type { Db } from "./db";
import { packArt } from "./pack-art";

/**
 * Naucera product catalogue, from "Naucera_Product_List.xlsx".
 * The sheet lists products and pack sizes only – prices and stock were not included,
 * so products are created as DRAFT with price 0 until they are filled in from the admin.
 */

export const CATALOG_VERSION = "2";

export const NAUCERA_CATEGORIES = [
  { name: "Tea Premixes", slug: "tea-premixes", description: "Instant tea premixes – 1 kg packs and single-serve sachets." },
  { name: "Coffee Premixes", slug: "coffee-premixes", description: "Instant coffee premixes – 1 kg packs and single-serve sachets." },
  { name: "Cooler Premixes", slug: "cooler-premixes", description: "Cold beverage premixes – 1 kg packs and single-serve sachets." },
];

const KG = { name: "1 kg", code: "1K", grams: 1000 };
const SACHET = { name: "Single-serve sachet", code: "SCH", grams: 0 };

type CatalogProduct = { title: string; cat: string; variants: (typeof KG)[]; color: string; accent: string };

export const NAUCERA_PRODUCTS: CatalogProduct[] = [
  // Tea Premixes (+ "Tea Premixes Sachet")
  { title: "Select Tea", cat: "tea-premixes", variants: [KG], color: "#8a3b12", accent: "#f5c06b" },
  { title: "Kadak Tea", cat: "tea-premixes", variants: [KG, SACHET], color: "#6b2a10", accent: "#f3b562" },
  { title: "Cardamom Tea Gold", cat: "tea-premixes", variants: [KG], color: "#4f6b2f", accent: "#e8c766" },
  { title: "Lemon Tea", cat: "tea-premixes", variants: [KG], color: "#b58a00", accent: "#fff3b0" },
  { title: "Laung Elaichi Tea", cat: "tea-premixes", variants: [SACHET], color: "#5a3d2b", accent: "#e6d38a" },
  // Coffee Premixes (+ "Coffee Premixes Sachet")
  { title: "Select Coffee", cat: "coffee-premixes", variants: [KG], color: "#4a2a1c", accent: "#e8c28a" },
  { title: "Kadak Coffee", cat: "coffee-premixes", variants: [KG], color: "#2e1a12", accent: "#d9a35b" },
  { title: "Coffee Gold", cat: "coffee-premixes", variants: [KG], color: "#5b3a29", accent: "#e8c766" },
  { title: "Special Coffee", cat: "coffee-premixes", variants: [SACHET], color: "#7a4e33", accent: "#f2d7b0" },
  // Cooler Premixes
  { title: "Moh Maya", cat: "cooler-premixes", variants: [KG, SACHET], color: "#7b2d5b", accent: "#f6c1dc" },
  { title: "Jalwa Lemonade", cat: "cooler-premixes", variants: [KG, SACHET], color: "#a68a00", accent: "#fff6b8" },
  { title: "Cold Coffee", cat: "cooler-premixes", variants: [KG, SACHET], color: "#3b2f2f", accent: "#e0b97a" },
  { title: "Lemon Iced Tea", cat: "cooler-premixes", variants: [KG, SACHET], color: "#8f5a00", accent: "#ffe08a" },
  { title: "Aam Panna", cat: "cooler-premixes", variants: [KG, SACHET], color: "#5f8a1c", accent: "#f5e27a" },
];

const slugOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Inserts the Naucera categories and products. Skips anything whose slug already exists. */
export async function insertCatalog(d: Db) {
  const catIds: Record<string, number> = {};
  for (const [i, c] of NAUCERA_CATEGORIES.entries()) {
    const existing = await d.get<{ id: number }>("SELECT id FROM categories WHERE slug = ?", c.slug);
    catIds[c.slug] = existing
      ? existing.id
      : (await d.run("INSERT INTO categories (name, slug, description, sort) VALUES (?, ?, ?, ?)", c.name, c.slug, c.description, i)).insertId;
  }

  for (const p of NAUCERA_PRODUCTS) {
    const slug = slugOf(p.title);
    if (await d.get("SELECT id FROM products WHERE slug = ?", slug)) continue;
    const catName = NAUCERA_CATEGORIES.find((c) => c.slug === p.cat)!.name;
    const sizes = p.variants.map((v) => (v === KG ? "1 kg pack" : "single-serve sachet")).join(" and ");
    const short = `${p.title} – ${catName.toLowerCase().replace(/s$/, "")}, available as ${sizes}.`;
    const tags = [catName.split(" ")[0].toLowerCase(), "premix", ...p.variants.map((v) => (v === KG ? "1kg" : "sachet"))].join(", ");
    const pid = (
      await d.run(
        `INSERT INTO products (title, slug, short_description, description, category_id, status, tags, featured, ingredients, how_to_use, shelf_life, seo_title, seo_description, created_at, updated_at)
         VALUES (?, ?, ?, '', ?, 'draft', ?, 0, '', '', '', ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
        p.title, slug, short, catIds[p.cat], tags, `${p.title} | Naucera`, short
      )
    ).insertId;

    const svg = Buffer.from(packArt({ title: p.title, subtitle: catName.replace(" Premixes", ""), color: p.color, accent: p.accent }));
    const file = `${slug}.svg`;
    const mid = (await d.run("INSERT INTO media (filename, mime, size, data) VALUES (?, 'image/svg+xml', ?, ?)", file, svg.length, svg)).insertId;
    await d.run("INSERT INTO product_images (product_id, url, alt, position) VALUES (?, ?, ?, 0)", pid, `/uploads/${mid}/${file}`, p.title);

    const skuBase = "NC-" + slug.split("-").map((w) => w[0]).join("").toUpperCase();
    for (const [i, v] of p.variants.entries()) {
      await d.run(
        "INSERT INTO product_variants (product_id, name, sku, price, compare_at_price, stock, weight_grams, position) VALUES (?, ?, ?, 0, NULL, 0, ?, ?)",
        pid, v.name, `${skuBase}-${v.code}`, v.grams, i
      );
    }
  }
}

/* ---------- Removal of the demo data shipped with the first version ---------- */

const DEMO_PRODUCT_SLUGS = [
  "classic-instant-coffee-premix", "south-indian-filter-coffee-premix", "cappuccino-premix", "hazelnut-coffee-premix",
  "masala-chai-premix", "elaichi-tea-premix", "ginger-tea-premix", "lemon-tea-premix", "kesar-chai-premix",
  "hot-chocolate-premix", "badam-milk-premix", "sugar-free-coffee-premix", "sugar-free-masala-chai-premix",
  "vending-coffee-premix-bulk", "vending-tea-premix-bulk",
];
const DEMO_CATEGORY_SLUGS = ["coffee-premix", "tea-premix", "flavoured-premix", "sugar-free", "vending-horeca"];

export async function removeDemoData(d: Db) {
  const ph = (a: unknown[]) => a.map(() => "?").join(",");
  // Demo customers all use @example.com addresses; remove their orders first.
  await d.run("DELETE o FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.email LIKE '%@example.com'");
  await d.run("DELETE FROM customers WHERE email LIKE '%@example.com'");

  const imgs = await d.all<{ url: string }>(
    `SELECT i.url FROM product_images i JOIN products p ON p.id = i.product_id WHERE p.slug IN (${ph(DEMO_PRODUCT_SLUGS)})`,
    ...DEMO_PRODUCT_SLUGS
  );
  await d.run(`DELETE FROM products WHERE slug IN (${ph(DEMO_PRODUCT_SLUGS)})`, ...DEMO_PRODUCT_SLUGS);
  const mediaIds = imgs.map((i) => Number(/^\/uploads\/(\d+)\//.exec(i.url)?.[1])).filter(Boolean);
  // Only delete images no longer used by any product (e.g. not reused by a duplicated product).
  for (const id of mediaIds) {
    const used = await d.get("SELECT id FROM product_images WHERE url LIKE ? LIMIT 1", `/uploads/${id}/%`);
    if (!used) await d.run("DELETE FROM media WHERE id = ?", id);
  }
  // Remove demo categories only if nothing is left in them.
  await d.run(
    `DELETE FROM categories WHERE slug IN (${ph(DEMO_CATEGORY_SLUGS)}) AND NOT EXISTS (SELECT 1 FROM products p WHERE p.category_id = categories.id)`,
    ...DEMO_CATEGORY_SLUGS
  );
}
