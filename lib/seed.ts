import type { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { packArt } from "./pack-art";

/**
 * SAMPLE DATA – placeholder catalogue, customers and orders so the dashboard
 * has something to show. Replace with the real Naucera catalogue from the admin.
 */

const categories = [
  { name: "Coffee Premix", slug: "coffee-premix", description: "Instant coffee premixes – just add hot water." },
  { name: "Tea Premix", slug: "tea-premix", description: "Classic Indian chai premixes, ready in seconds." },
  { name: "Flavoured Premix", slug: "flavoured-premix", description: "Hot chocolate, badam milk and other speciality blends." },
  { name: "Sugar-Free Range", slug: "sugar-free", description: "Premixes sweetened without added sugar." },
  { name: "Vending & HORECA", slug: "vending-horeca", description: "Bulk packs for vending machines, offices, hotels and cafés." },
];

type SeedProduct = {
  title: string;
  cat: string;
  short: string;
  color: string;
  accent: string;
  label: string;
  tags: string;
  featured?: boolean;
  status?: string;
  ingredients: string;
  variants: { name: string; price: number; compare?: number; stock: number; grams: number }[];
};

const retail = (p250: number, p500: number, p1k: number, stock: [number, number, number]) => [
  { name: "250 g", price: p250, compare: Math.round(p250 * 1.15), stock: stock[0], grams: 250 },
  { name: "500 g", price: p500, compare: Math.round(p500 * 1.15), stock: stock[1], grams: 500 },
  { name: "1 kg", price: p1k, compare: Math.round(p1k * 1.15), stock: stock[2], grams: 1000 },
];

const products: SeedProduct[] = [
  {
    title: "Classic Instant Coffee Premix", cat: "coffee-premix", label: "Coffee", color: "#5b3a29", accent: "#e8c28a",
    short: "Rich, creamy instant coffee with milk and sugar – just add hot water.", tags: "coffee, bestseller, instant", featured: true,
    ingredients: "Sugar, milk solids, instant coffee powder, permitted stabilisers.", variants: retail(199, 369, 699, [84, 120, 46]),
  },
  {
    title: "South Indian Filter Coffee Premix", cat: "coffee-premix", label: "Filter Coffee", color: "#3e2418", accent: "#d9a35b",
    short: "The authentic decoction taste of filter kaapi, minus the filter.", tags: "coffee, filter, south indian", featured: true,
    ingredients: "Sugar, milk solids, coffee-chicory blend (80:20), permitted stabilisers.", variants: retail(229, 429, 799, [60, 72, 18]),
  },
  {
    title: "Cappuccino Premix", cat: "coffee-premix", label: "Cappuccino", color: "#7a4e33", accent: "#f2d7b0",
    short: "Café-style frothy cappuccino at home or office.", tags: "coffee, cappuccino, frothy",
    ingredients: "Sugar, milk solids, instant coffee, foaming agent.", variants: retail(249, 469, 879, [40, 55, 9]),
  },
  {
    title: "Hazelnut Coffee Premix", cat: "coffee-premix", label: "Hazelnut", color: "#6b4226", accent: "#f0c987",
    short: "Smooth coffee with a toasted hazelnut finish.", tags: "coffee, flavoured, hazelnut",
    ingredients: "Sugar, milk solids, instant coffee, nature-identical hazelnut flavour.", variants: retail(269, 499, 949, [22, 30, 4]),
  },
  {
    title: "Masala Chai Premix", cat: "tea-premix", label: "Masala Chai", color: "#8a3b12", accent: "#f5c06b",
    short: "Assam tea with ginger, cardamom, clove and black pepper.", tags: "tea, chai, masala, bestseller", featured: true,
    ingredients: "Sugar, milk solids, Assam tea extract, spice blend (ginger, cardamom, clove, pepper).", variants: retail(179, 329, 619, [110, 140, 60]),
  },
  {
    title: "Elaichi Tea Premix", cat: "tea-premix", label: "Elaichi Chai", color: "#4f6b2f", accent: "#e6d38a",
    short: "Comforting cardamom chai, the way it’s made at home.", tags: "tea, chai, cardamom",
    ingredients: "Sugar, milk solids, tea extract, natural cardamom.", variants: retail(179, 329, 619, [70, 95, 33]),
  },
  {
    title: "Ginger Tea Premix", cat: "tea-premix", label: "Adrak Chai", color: "#a0521d", accent: "#fbe3a1",
    short: "Strong adrak chai with a warming ginger kick.", tags: "tea, chai, ginger",
    ingredients: "Sugar, milk solids, tea extract, dehydrated ginger.", variants: retail(179, 329, 619, [52, 64, 7]),
  },
  {
    title: "Lemon Tea Premix", cat: "tea-premix", label: "Lemon Tea", color: "#b58a00", accent: "#fff3b0",
    short: "Light, zesty lemon tea – hot or iced.", tags: "tea, lemon, no milk",
    ingredients: "Sugar, tea extract, lemon flavour, citric acid.", variants: retail(159, 289, 539, [35, 48, 20]),
  },
  {
    title: "Kesar Chai Premix", cat: "tea-premix", label: "Kesar Chai", color: "#9c2f1b", accent: "#ffc76b", status: "draft",
    short: "Festive saffron chai with a hint of cardamom.", tags: "tea, saffron, premium, new",
    ingredients: "Sugar, milk solids, tea extract, saffron, cardamom.", variants: retail(299, 559, 1049, [0, 0, 0]),
  },
  {
    title: "Hot Chocolate Premix", cat: "flavoured-premix", label: "Hot Chocolate", color: "#4a2a1c", accent: "#f3b9a0",
    short: "Thick, velvety cocoa drink loved by kids and adults.", tags: "chocolate, kids, winter", featured: true,
    ingredients: "Sugar, milk solids, cocoa powder, permitted emulsifiers.", variants: retail(249, 469, 879, [44, 38, 12]),
  },
  {
    title: "Badam Milk Premix", cat: "flavoured-premix", label: "Badam Milk", color: "#c27c1e", accent: "#fff0c9",
    short: "Almond and saffron milk – serve hot or chilled.", tags: "badam, almond, kesar",
    ingredients: "Sugar, milk solids, almond powder, saffron, cardamom.", variants: retail(229, 429, 799, [26, 20, 3]),
  },
  {
    title: "Sugar-Free Coffee Premix", cat: "sugar-free", label: "Sugar Free", color: "#2f4858", accent: "#bfe3d3",
    short: "All the creaminess of our classic coffee, sweetened with stevia.", tags: "coffee, sugar free, diabetic friendly",
    ingredients: "Milk solids, instant coffee, stevia, permitted stabilisers.", variants: retail(279, 519, 979, [30, 25, 10]),
  },
  {
    title: "Sugar-Free Masala Chai Premix", cat: "sugar-free", label: "Sugar Free", color: "#33534a", accent: "#d6efc7",
    short: "Spiced masala chai with zero added sugar.", tags: "tea, chai, sugar free",
    ingredients: "Milk solids, tea extract, spice blend, stevia.", variants: retail(259, 489, 919, [18, 22, 6]),
  },
  {
    title: "Vending Coffee Premix – Bulk", cat: "vending-horeca", label: "Vending 1 kg", color: "#3b2f2f", accent: "#e0b97a",
    short: "Free-flowing premix engineered for vending machines. Ideal for offices.", tags: "vending, bulk, coffee, b2b",
    ingredients: "Sugar, milk solids, instant coffee, anti-caking agent.",
    variants: [
      { name: "1 kg", price: 649, stock: 140, grams: 1000 },
      { name: "5 × 1 kg (carton)", price: 3099, compare: 3245, stock: 32, grams: 5000 },
      { name: "10 × 1 kg (carton)", price: 5999, compare: 6490, stock: 14, grams: 10000 },
    ],
  },
  {
    title: "Vending Tea Premix – Bulk", cat: "vending-horeca", label: "Vending 1 kg", color: "#5a2d0c", accent: "#f1c27d",
    short: "Consistent cup-after-cup chai for vending machines and canteens.", tags: "vending, bulk, tea, b2b",
    ingredients: "Sugar, milk solids, tea extract, anti-caking agent.",
    variants: [
      { name: "1 kg", price: 579, stock: 160, grams: 1000 },
      { name: "5 × 1 kg (carton)", price: 2799, compare: 2895, stock: 40, grams: 5000 },
      { name: "10 × 1 kg (carton)", price: 5399, compare: 5790, stock: 11, grams: 10000 },
    ],
  },
];

const customerSeed: [string, string, string, string][] = [
  ["Aarav Sharma", "9876543210", "Bengaluru", "Karnataka"],
  ["Priya Nair", "9845012345", "Kochi", "Kerala"],
  ["Rohan Mehta", "9820098765", "Mumbai", "Maharashtra"],
  ["Ananya Iyer", "9884456789", "Chennai", "Tamil Nadu"],
  ["Vikram Singh", "9811122233", "New Delhi", "Delhi"],
  ["Sneha Reddy", "9849988776", "Hyderabad", "Telangana"],
  ["Karthik Rao", "9900112233", "Mysuru", "Karnataka"],
  ["Meera Joshi", "9822334455", "Pune", "Maharashtra"],
  ["Arjun Das", "9831045678", "Kolkata", "West Bengal"],
  ["Fatima Khan", "9898765432", "Ahmedabad", "Gujarat"],
  ["Rahul Verma", "9839012345", "Lucknow", "Uttar Pradesh"],
  ["Divya Menon", "9895123456", "Thiruvananthapuram", "Kerala"],
  ["Brew & Co. Café", "9741234567", "Bengaluru", "Karnataka"],
  ["TechPark Canteen Services", "9886001122", "Hyderabad", "Telangana"],
  ["Nikhil Gupta", "9910203040", "Jaipur", "Rajasthan"],
  ["Lakshmi Pillai", "9443322110", "Coimbatore", "Tamil Nadu"],
];

// Deterministic pseudo-random so every fresh install shows the same demo data.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function seed(d: DatabaseSync, uploadDir: string) {
  const rand = rng(42);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  d.exec("BEGIN");
  try {
    const catIns = d.prepare("INSERT INTO categories (name, slug, description, sort) VALUES (?, ?, ?, ?)");
    const catIds: Record<string, number> = {};
    categories.forEach((c, i) => {
      catIds[c.slug] = Number(catIns.run(c.name, c.slug, c.description, i).lastInsertRowid);
    });

    const pIns = d.prepare(
      `INSERT INTO products (title, slug, short_description, description, category_id, status, tags, featured, ingredients, how_to_use, shelf_life, seo_title, seo_description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const vIns = d.prepare(
      "INSERT INTO product_variants (product_id, name, sku, price, compare_at_price, stock, weight_grams, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    const iIns = d.prepare("INSERT INTO product_images (product_id, url, alt, position) VALUES (?, ?, ?, 0)");

    const allVariants: { pid: number; vid: number; title: string; name: string; price: number }[] = [];
    products.forEach((p, idx) => {
      const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const created = new Date(Date.now() - (120 - idx * 5) * 86400000).toISOString().slice(0, 19).replace("T", " ");
      const desc = `${p.short}\n\nMade with carefully selected ingredients, ${p.title} gives you a consistent, great-tasting cup every single time. Perfect for homes, offices, cafés and travel.`;
      const pid = Number(
        pIns.run(
          p.title, slug, p.short, desc, catIds[p.cat], p.status ?? "active", p.tags, p.featured ? 1 : 0, p.ingredients,
          "Add 2 heaped teaspoons (approx. 18 g) to 150 ml of hot water. Stir well and enjoy.",
          "9 months from date of manufacture", `${p.title} | Naucera`, p.short, created, created
        ).lastInsertRowid
      );
      const file = `seed-${slug}.svg`;
      fs.writeFileSync(path.join(uploadDir, file), packArt({ title: p.title.replace(/ Premix.*$/, ""), subtitle: p.label, color: p.color, accent: p.accent }));
      iIns.run(pid, `/uploads/${file}`, p.title);
      const skuBase = "NC-" + slug.split("-").map((w) => w[0]).join("").toUpperCase().slice(0, 4);
      p.variants.forEach((v, vi) => {
        const vid = Number(
          vIns.run(pid, v.name, `${skuBase}-${v.grams >= 1000 ? v.grams / 1000 + "K" : v.grams}`, v.price, v.compare ?? null, v.stock, v.grams, vi).lastInsertRowid
        );
        if ((p.status ?? "active") === "active") allVariants.push({ pid, vid, title: p.title, name: v.name, price: v.price });
      });
    });

    const cIns = d.prepare("INSERT INTO customers (name, email, phone, city, state, created_at) VALUES (?, ?, ?, ?, ?, ?)");
    const custIds = customerSeed.map(([name, phone, city, state], i) => {
      const email = name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/(^\.|\.$)/g, "") + "@example.com";
      const created = new Date(Date.now() - (90 - i * 4) * 86400000).toISOString().slice(0, 19).replace("T", " ");
      return { id: Number(cIns.run(name, email, phone, city, state, created).lastInsertRowid), name, city, state };
    });

    const oIns = d.prepare(
      `INSERT INTO orders (number, customer_id, status, payment_status, payment_method, subtotal, shipping, discount, total, shipping_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const oiIns = d.prepare("INSERT INTO order_items (order_id, product_id, variant_id, title, variant_name, price, qty) VALUES (?, ?, ?, ?, ?, ?, ?)");
    const N = 86;
    for (let i = 0; i < N; i++) {
      const daysAgo = Math.floor(Math.pow(rand(), 1.3) * 60);
      const date = new Date(Date.now() - daysAgo * 86400000 - Math.floor(rand() * 86400000));
      const c = pick(custIds);
      const isB2B = /Café|Canteen/.test(c.name);
      const lines = 1 + Math.floor(rand() * 3);
      const items: { v: (typeof allVariants)[number]; qty: number }[] = [];
      for (let l = 0; l < lines; l++) {
        const v = isB2B ? pick(allVariants.filter((x) => x.price > 500)) : pick(allVariants.filter((x) => x.price < 1100));
        if (items.some((it) => it.v.vid === v.vid)) continue;
        items.push({ v, qty: 1 + Math.floor(rand() * (isB2B ? 4 : 2)) });
      }
      const subtotal = items.reduce((s, it) => s + it.v.price * it.qty, 0);
      const shipping = subtotal >= 499 ? 0 : 49;
      const discount = rand() < 0.2 ? Math.round(subtotal * 0.1) : 0;
      const total = subtotal + shipping - discount;
      let status: string;
      if (daysAgo <= 1) status = pick(["pending", "pending", "processing"]);
      else if (daysAgo <= 4) status = pick(["processing", "shipped", "shipped"]);
      else status = rand() < 0.06 ? "cancelled" : "delivered";
      const method = pick(["UPI", "UPI", "UPI", "Card", "Cash on Delivery", "Net Banking"]);
      const payment = status === "cancelled" ? "refunded" : method === "Cash on Delivery" && status !== "delivered" ? "pending" : "paid";
      const addr = `${c.name}\n${10 + Math.floor(rand() * 200)}, ${pick(["MG Road", "Anna Nagar", "Indiranagar", "Park Street", "Banjara Hills", "Bandra West", "Koregaon Park"])}\n${c.city}, ${c.state}\nIndia`;
      const oid = Number(
        oIns.run(
          `#${1001 + i}`, c.id, status, payment, method, subtotal, shipping, discount, total, addr,
          date.toISOString().slice(0, 19).replace("T", " ")
        ).lastInsertRowid
      );
      items.forEach((it) => oiIns.run(oid, it.v.pid, it.v.vid, it.v.title, it.v.name, it.v.price, it.qty));
    }

    const sIns = d.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    const settings: Record<string, string> = {
      store_name: "Naucera",
      tagline: "Coffee & Tea Premixes",
      email: "hello@naucera.in",
      phone: "+91 00000 00000",
      address: "",
      gstin: "",
      currency: "INR",
      shipping_flat: "49",
      free_shipping_threshold: "499",
      low_stock_threshold: "10",
    };
    for (const [k, v] of Object.entries(settings)) sIns.run(k, v);
    d.exec("COMMIT");
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}
