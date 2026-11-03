import type { Db } from "./db";
import { packArt } from "./pack-art";

/**
 * Naucera product catalogue, from "Naucera_Product_List.xlsx".
 * The sheet lists products and pack sizes only – prices and stock were not included,
 * so variants start at price 0, which the store shows as "Price on request".
 * Pack photos are the official artwork from the "Naucera Assets" brand folder (public/products),
 * trimmed and converted to WebP. Products without a photo get a generated placeholder pack.
 */

export const CATALOG_VERSION = "4";

/** Official pack photos per product slug (first = cover; second = single-serve sachet or lifestyle shot). */
export const CATALOG_IMAGES: Record<string, string[]> = {
  "select-tea": ["/products/select-tea.webp"],
  "kadak-tea": ["/products/kadak-tea.webp", "/products/kadak-tea-sachet.webp"],
  "cardamom-tea-gold": ["/products/cardamom-tea-gold.webp"],
  "lemon-tea": ["/products/lemon-tea.webp"],
  "laung-elaichi-tea": ["/products/laung-elaichi-tea.webp", "/catalog/laung-elaichi-tea-2.webp"],
  "select-coffee": ["/products/select-coffee.webp"],
  "kadak-coffee": ["/products/kadak-coffee.webp", "/story/kadak-coffee-lifestyle.webp"],
  "coffee-gold": ["/products/coffee-gold.webp"],
  "special-coffee": ["/products/special-coffee.webp"],
  "moh-maya": ["/products/moh-maya.webp", "/products/moh-maya-sachet.webp"],
  "jalwa-lemonade": ["/products/jalwa-lemonade.webp", "/products/jalwa-lemonade-sachet.webp"],
  "cold-coffee": ["/products/cold-coffee.webp", "/products/cold-coffee-sachet.webp"],
  "lemon-iced-tea": ["/products/lemon-iced-tea.webp", "/products/lemon-iced-tea-sachet.webp"],
  "aam-panna": ["/products/aam-panna.webp", "/products/aam-panna-sachet.webp"],
};

/** naucera.in photos used by catalogue v3 (public/catalog), replaced by the v4 upgrade if never edited. */
const V3_CATALOG_IMAGES: Record<string, string[]> = {
  "kadak-tea": ["/catalog/kadak-tea-1kg.webp", "/catalog/kadak-tea-sachet.webp"],
  "cardamom-tea-gold": ["/catalog/cardamom-tea-gold.webp"],
  "lemon-tea": ["/catalog/lemon-tea.webp"],
  "laung-elaichi-tea": ["/catalog/laung-elaichi-tea.webp", "/catalog/laung-elaichi-tea-2.webp"],
  "kadak-coffee": ["/catalog/kadak-coffee-1kg.webp", "/story/kadak-coffee-lifestyle.webp"],
  "special-coffee": ["/catalog/special-coffee.webp"],
  "moh-maya": ["/catalog/moh-maya.webp"],
  "cold-coffee": ["/catalog/cold-coffee.webp"],
  "aam-panna": ["/catalog/aam-panna.webp"],
};

/** Draft product copy – review and edit in the admin. */
export const CATALOG_DESCRIPTIONS: Record<string, string> = {
  "select-tea": "A smooth, well-balanced tea premix for an everyday cup of chai. Just add hot water, stir and enjoy.",
  "kadak-tea": "Strong, bold and full-bodied – Kadak Tea is made for those who like their chai with a kick. Available in a 1 kg pack and handy single-serve sachets.",
  "cardamom-tea-gold": "Fragrant elaichi chai with the rich, comforting aroma of cardamom in every sip.",
  "lemon-tea": "A light, refreshing lemon-flavoured tea premix – a zesty pick-me-up at any time of day.",
  "laung-elaichi-tea": "The warming spice of laung (clove) and elaichi (cardamom) in a single-serve sachet – perfect for chai on the go.",
  "select-coffee": "A smooth, creamy instant coffee premix for a dependable cup, every time.",
  "kadak-coffee": "Bold, strong and aromatic – Kadak Coffee is for those who like their coffee with character.",
  "coffee-gold": "A rich, premium coffee premix for an indulgent, café-style cup.",
  "special-coffee": "Our Special Coffee in a single-serve sachet – a creamy cup of coffee wherever you are.",
  "moh-maya": "A refreshing cold-drink premix – mix with chilled water and ice for an instant cooler.",
  "jalwa-lemonade": "Tangy, refreshing lemonade in an instant – mix with chilled water for a burst of citrus.",
  "cold-coffee": "Café-style cold coffee in seconds – just mix with chilled water and add ice.",
  "lemon-iced-tea": "Chilled tea with a squeeze of lemon – a cool, refreshing iced tea in seconds.",
  "aam-panna": "The classic Indian raw-mango summer cooler, ready in seconds.",
};

/** Contact details shown on naucera.in, used as store defaults when empty. */
export const STORE_CONTACT_DEFAULTS: Record<string, string> = {
  phone: "+91 91270 64580",
  whatsapp: "919127064580",
  address: "707, N.T. Road, Nalbari, Assam 781335, India",
};

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
    const short = CATALOG_DESCRIPTIONS[slug] ?? `${p.title} – ${catName.toLowerCase().replace(/es$/, "")}.`;
    const tags = [catName.split(" ")[0].toLowerCase(), "premix", ...p.variants.map((v) => (v === KG ? "1kg" : "sachet"))].join(", ");
    const pid = (
      await d.run(
        `INSERT INTO products (title, slug, short_description, description, category_id, status, tags, featured, ingredients, how_to_use, shelf_life, seo_title, seo_description, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'active', ?, ?, '', '', '', ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
        p.title, slug, short, CATALOG_DESCRIPTIONS[slug] ?? "", catIds[p.cat], tags, CATALOG_IMAGES[slug] ? 1 : 0, `${p.title} | Naucera`, short
      )
    ).insertId;

    const photos = CATALOG_IMAGES[slug];
    if (photos) {
      for (const [i, url] of photos.entries()) await d.run("INSERT INTO product_images (product_id, url, alt, position) VALUES (?, ?, ?, ?)", pid, url, p.title, i);
    } else {
      const svg = Buffer.from(packArt({ title: p.title, subtitle: catName.replace(" Premixes", ""), color: p.color, accent: p.accent }));
      const file = `${slug}.svg`;
      const mid = (await d.run("INSERT INTO media (filename, mime, size, data) VALUES (?, 'image/svg+xml', ?, ?)", file, svg.length, svg)).insertId;
      await d.run("INSERT INTO product_images (product_id, url, alt, position) VALUES (?, ?, ?, 0)", pid, `/uploads/${mid}/${file}`, p.title);
    }

    const skuBase = "NC-" + slug.split("-").map((w) => w[0]).join("").toUpperCase();
    for (const [i, v] of p.variants.entries()) {
      await d.run(
        "INSERT INTO product_variants (product_id, name, sku, price, compare_at_price, stock, weight_grams, position) VALUES (?, ?, ?, 0, NULL, 0, ?, ?)",
        pid, v.name, `${skuBase}-${v.code}`, v.grams, i
      );
    }
  }
}

/**
 * Upgrade for databases loaded with catalogue v2: swap generated placeholder packs for the real
 * naucera.in photos, fill empty descriptions, publish untouched drafts and fill empty contact settings.
 * Anything already edited in the admin is left alone.
 */
export async function upgradeCatalogToV3(d: Db) {
  for (const p of NAUCERA_PRODUCTS) {
    const slug = slugOf(p.title);
    const row = await d.get<{ id: number; status: string; description: string | null; changed: number }>(
      "SELECT id, status, description, updated_at > created_at AS changed FROM products WHERE slug = ?", slug
    );
    if (!row) continue;
    const photos = CATALOG_IMAGES[slug];
    if (photos) {
      const imgs = await d.all<{ url: string }>("SELECT url FROM product_images WHERE product_id = ?", row.id);
      const onlyPlaceholder = imgs.length === 0 || imgs.every((i) => /^\/uploads\/\d+\/[a-z0-9-]+\.svg$/.test(i.url));
      if (onlyPlaceholder) {
        for (const i of imgs) {
          const mid = Number(/^\/uploads\/(\d+)\//.exec(i.url)?.[1]);
          if (mid) await d.run("DELETE FROM media WHERE id = ? AND mime = 'image/svg+xml'", mid);
        }
        await d.run("DELETE FROM product_images WHERE product_id = ?", row.id);
        for (const [i, url] of photos.entries()) await d.run("INSERT INTO product_images (product_id, url, alt, position) VALUES (?, ?, ?, ?)", row.id, url, p.title, i);
        await d.run("UPDATE products SET featured = 1 WHERE id = ? AND featured = 0", row.id);
      }
    }
    if (!row.description && CATALOG_DESCRIPTIONS[slug]) await d.run("UPDATE products SET description = ? WHERE id = ?", CATALOG_DESCRIPTIONS[slug], row.id);
    // v2 generated summaries like "Kadak Tea – tea premixe, available as …" – replace if never edited.
    if (CATALOG_DESCRIPTIONS[slug]) {
      await d.run("UPDATE products SET short_description = ? WHERE id = ? AND short_description LIKE '% premixe, available as %'", CATALOG_DESCRIPTIONS[slug], row.id);
      await d.run("UPDATE products SET seo_description = ? WHERE id = ? AND seo_description LIKE '% premixe, available as %'", CATALOG_DESCRIPTIONS[slug], row.id);
    }
    if (row.status === "draft" && !Number(row.changed)) await d.run("UPDATE products SET status = 'active' WHERE id = ?", row.id);
  }
  for (const [k, v] of Object.entries(STORE_CONTACT_DEFAULTS)) {
    await d.run("INSERT INTO settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = IF(value IS NULL OR value = '', VALUES(value), value)", k, v);
  }
}

/**
 * Upgrade to catalogue v4: swap the v3 naucera.in photos and generated placeholder packs for the official
 * pack artwork. Products that have any image uploaded in the admin are left alone.
 */
export async function upgradeCatalogToV4(d: Db) {
  const isPlaceholder = (u: string) => /^\/uploads\/\d+\/[a-z0-9-]+\.svg$/.test(u);
  for (const p of NAUCERA_PRODUCTS) {
    const slug = slugOf(p.title);
    const photos = CATALOG_IMAGES[slug];
    const row = await d.get<{ id: number }>("SELECT id FROM products WHERE slug = ?", slug);
    if (!row || !photos) continue;
    const urls = (await d.all<{ url: string }>("SELECT url FROM product_images WHERE product_id = ? ORDER BY position, id", row.id)).map((i) => i.url);
    const stock = V3_CATALOG_IMAGES[slug] ?? [];
    if (!urls.every((u) => isPlaceholder(u) || stock.includes(u))) continue;
    if (urls.join("|") === photos.join("|")) continue;
    for (const u of urls.filter(isPlaceholder)) {
      await d.run("DELETE FROM media WHERE id = ? AND mime = 'image/svg+xml'", Number(/^\/uploads\/(\d+)\//.exec(u)![1]));
    }
    await d.run("DELETE FROM product_images WHERE product_id = ?", row.id);
    for (const [i, url] of photos.entries()) await d.run("INSERT INTO product_images (product_id, url, alt, position) VALUES (?, ?, ?, ?)", row.id, url, p.title, i);
    if (urls.every(isPlaceholder)) await d.run("UPDATE products SET featured = 1 WHERE id = ? AND featured = 0", row.id);
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
