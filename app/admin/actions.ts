"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkCredentials, createSession, destroySession, requireAdmin, adminEmail } from "@/lib/auth";
import { get, run, transaction, type Db } from "@/lib/db";
import { slugify, ORDER_STATUSES, PAYMENT_STATUSES, PAYMENT_METHODS } from "@/lib/format";

export type FormState = { error?: string } | undefined;

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

/* ---------- Auth ---------- */

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email");
  const password = String(fd.get("password") ?? "");
  if (!checkCredentials(email, password)) return { error: "Incorrect email or password." };
  await createSession(adminEmail());
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------- Products ---------- */

type VariantInput = { id?: number; name: string; sku: string; price: string | number; compare_at_price?: string | number | null; stock: string | number; weight_grams?: string | number };
type ImageInput = { url: string; alt?: string };

async function uniqueSlug(base: string, table: "products" | "categories", excludeId?: number) {
  const root = base || "item";
  let slug = root;
  let n = 1;
  while (await get(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`, slug, excludeId ?? -1)) slug = `${root}-${++n}`;
  return slug;
}

export async function saveProduct(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(fd.get("id") || 0) || undefined;
  const title = str(fd, "title");
  if (!title) return { error: "Product title is required." };

  let variants: VariantInput[] = [];
  let images: ImageInput[] = [];
  try {
    variants = JSON.parse(String(fd.get("variants") || "[]"));
    images = JSON.parse(String(fd.get("images") || "[]"));
  } catch {
    return { error: "Could not read variants/images." };
  }
  variants = variants.filter((v) => String(v.name).trim());
  if (variants.length === 0) return { error: "Add at least one variant (e.g. 250 g) with a price." };
  for (const v of variants) {
    if (!(Number(v.price) >= 0) || String(v.price).trim() === "") return { error: `Enter a valid price for “${v.name}”.` };
  }

  const slug = await uniqueSlug(slugify(str(fd, "slug") || title), "products", id);
  const fields = [
    title, slug, str(fd, "short_description"), str(fd, "description"),
    Number(fd.get("category_id")) || null, ["active", "draft", "archived"].includes(str(fd, "status")) ? str(fd, "status") : "draft",
    str(fd, "tags"), fd.get("featured") ? 1 : 0, str(fd, "ingredients"), str(fd, "how_to_use"), str(fd, "shelf_life"),
    str(fd, "seo_title"), str(fd, "seo_description"),
  ] as const;

  const productId = await transaction(async (d: Db) => {
    let pid = id;
    if (pid) {
      await d.run(
        `UPDATE products SET title=?, slug=?, short_description=?, description=?, category_id=?, status=?, tags=?, featured=?,
         ingredients=?, how_to_use=?, shelf_life=?, seo_title=?, seo_description=?, updated_at=UTC_TIMESTAMP() WHERE id=?`,
        ...fields, pid
      );
    } else {
      pid = (
        await d.run(
          `INSERT INTO products (title, slug, short_description, description, category_id, status, tags, featured,
           ingredients, how_to_use, shelf_life, seo_title, seo_description, created_at, updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?, UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
          ...fields
        )
      ).insertId;
    }

    // Variants: update existing, insert new, delete removed (keeps order history linked).
    const keep = variants.filter((v) => v.id).map((v) => Number(v.id));
    await d.run(`DELETE FROM product_variants WHERE product_id = ? ${keep.length ? `AND id NOT IN (${keep.map(() => "?").join(",")})` : ""}`, pid, ...keep);
    for (const [i, v] of variants.entries()) {
      const vals = [
        String(v.name).trim(), String(v.sku ?? "").trim(), Number(v.price),
        v.compare_at_price === "" || v.compare_at_price == null ? null : Number(v.compare_at_price),
        Math.max(0, Math.floor(Number(v.stock) || 0)), Math.floor(Number(v.weight_grams) || 0), i,
      ] as const;
      if (v.id) await d.run("UPDATE product_variants SET name=?, sku=?, price=?, compare_at_price=?, stock=?, weight_grams=?, position=? WHERE id=? AND product_id=?", ...vals, Number(v.id), pid);
      else await d.run("INSERT INTO product_variants (name, sku, price, compare_at_price, stock, weight_grams, position, product_id) VALUES (?,?,?,?,?,?,?,?)", ...vals, pid);
    }

    await d.run("DELETE FROM product_images WHERE product_id = ?", pid);
    for (const [i, img] of images.entries()) {
      if (img.url) await d.run("INSERT INTO product_images (product_id, url, alt, position) VALUES (?,?,?,?)", pid, String(img.url), String(img.alt ?? title), i);
    }
    return pid;
  });

  revalidatePath("/admin", "layout");
  redirect(`/admin/products/${productId}?saved=1`);
}

export async function deleteProduct(fd: FormData) {
  await requireAdmin();
  await run("DELETE FROM products WHERE id = ?", Number(fd.get("id")));
  revalidatePath("/admin", "layout");
  redirect("/admin/products?deleted=1");
}

export async function duplicateProduct(fd: FormData) {
  await requireAdmin();
  const src = Number(fd.get("id"));
  const p = await get<{ title: string }>("SELECT title FROM products WHERE id = ?", src);
  if (!p) redirect("/admin/products");
  const title = `${p.title} (Copy)`;
  const slug = await uniqueSlug(slugify(title), "products");
  const newId = await transaction(async (d) => {
    const pid = (
      await d.run(
        `INSERT INTO products (title, slug, short_description, description, category_id, status, tags, featured, ingredients, how_to_use, shelf_life, seo_title, seo_description, created_at, updated_at)
         SELECT ?, ?, short_description, description, category_id, 'draft', tags, 0, ingredients, how_to_use, shelf_life, seo_title, seo_description, UTC_TIMESTAMP(), UTC_TIMESTAMP() FROM products WHERE id = ?`,
        title, slug, src
      )
    ).insertId;
    await d.run("INSERT INTO product_variants (product_id, name, sku, price, compare_at_price, stock, weight_grams, position) SELECT ?, name, sku, price, compare_at_price, 0, weight_grams, position FROM product_variants WHERE product_id = ?", pid, src);
    await d.run("INSERT INTO product_images (product_id, url, alt, position) SELECT ?, url, alt, position FROM product_images WHERE product_id = ?", pid, src);
    return pid;
  });
  revalidatePath("/admin", "layout");
  redirect(`/admin/products/${newId}?saved=1`);
}

export async function setProductStatus(fd: FormData) {
  await requireAdmin();
  const status = str(fd, "status");
  if (!["active", "draft", "archived"].includes(status)) return;
  await run("UPDATE products SET status = ?, updated_at = UTC_TIMESTAMP() WHERE id = ?", status, Number(fd.get("id")));
  revalidatePath("/admin", "layout");
}

/* ---------- Inventory ---------- */

export async function updateStock(fd: FormData) {
  await requireAdmin();
  await transaction(async (d) => {
    for (const [k, v] of fd.entries()) {
      const m = /^stock_(\d+)$/.exec(k);
      if (m) await d.run("UPDATE product_variants SET stock = ? WHERE id = ?", Math.max(0, Math.floor(Number(v) || 0)), Number(m[1]));
    }
  });
  revalidatePath("/admin", "layout");
  redirect("/admin/inventory?saved=1");
}

/* ---------- Categories ---------- */

export async function saveCategory(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(fd.get("id") || 0) || undefined;
  const name = str(fd, "name");
  if (!name) return { error: "Category name is required." };
  const slug = await uniqueSlug(slugify(str(fd, "slug") || name), "categories", id);
  if (id) await run("UPDATE categories SET name=?, slug=?, description=? WHERE id=?", name, slug, str(fd, "description"), id);
  else {
    const max = (await get<{ m: number | null }>("SELECT MAX(sort) AS m FROM categories"))?.m ?? 0;
    await run("INSERT INTO categories (name, slug, description, sort) VALUES (?, ?, ?, ?)", name, slug, str(fd, "description"), Number(max) + 1);
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/categories?saved=1");
}

export async function deleteCategory(fd: FormData) {
  await requireAdmin();
  await run("DELETE FROM categories WHERE id = ?", Number(fd.get("id")));
  revalidatePath("/admin", "layout");
  redirect("/admin/categories?deleted=1");
}

/* ---------- Orders ---------- */

export async function updateOrder(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const status = str(fd, "status");
  const payment = str(fd, "payment_status");
  if (!(ORDER_STATUSES as readonly string[]).includes(status) || !(PAYMENT_STATUSES as readonly string[]).includes(payment)) return;
  await run("UPDATE orders SET status = ?, payment_status = ?, notes = ? WHERE id = ?", status, payment, str(fd, "notes"), id);
  revalidatePath("/admin", "layout");
  redirect(`/admin/orders/${id}?saved=1`);
}

type OrderItemInput = { product_id?: number | null; variant_id?: number | null; title: string; variant_name?: string; price: string | number; qty: string | number };

const money = (v: unknown) => Math.round(Number(v || 0) * 100) / 100;

/** Converts a datetime-local value entered in India time to a UTC 'YYYY-MM-DD HH:MM:SS' string. */
function istToUtc(local: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(local)) return null;
  const d = new Date(local.slice(0, 16) + ":00+05:30");
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 19).replace("T", " ");
}

/** Creates an order by hand (phone, WhatsApp, walk-in or distributor orders). */
export async function createOrder(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = str(fd, "customer_name");
  const phone = str(fd, "customer_phone");
  const email = str(fd, "customer_email").toLowerCase();
  const status = str(fd, "status") || "pending";
  const paymentStatus = str(fd, "payment_status") || "pending";
  const method = str(fd, "payment_method");
  if (!name) return { error: "Enter the customer’s name." };
  if (!phone && !email) return { error: "Enter the customer’s phone number or email." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "That email address doesn’t look right." };
  if (!(ORDER_STATUSES as readonly string[]).includes(status) || !(PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) return { error: "Choose a valid status." };
  if (!(PAYMENT_METHODS as readonly string[]).includes(method)) return { error: "Choose a payment method." };

  let raw: OrderItemInput[];
  try { raw = JSON.parse(String(fd.get("items") || "[]")); } catch { return { error: "Could not read the items. Please try again." }; }
  const items = raw
    .map((i) => ({ product_id: i.product_id ? Number(i.product_id) : null, variant_id: i.variant_id ? Number(i.variant_id) : null, title: String(i.title || "").trim().slice(0, 255), variant_name: String(i.variant_name || "").trim().slice(0, 191), price: money(i.price), qty: Math.floor(Number(i.qty)) }))
    .filter((i) => i.title);
  if (!items.length) return { error: "Add at least one item to the order." };
  if (items.some((i) => !(i.qty >= 1) || i.qty > 100000)) return { error: "Each item needs a quantity of at least 1." };
  if (items.some((i) => !(i.price >= 0))) return { error: "Prices can’t be negative." };

  const subtotal = money(items.reduce((s, i) => s + i.price * i.qty, 0));
  const shipping = money(fd.get("shipping"));
  const discount = money(fd.get("discount"));
  if (shipping < 0 || discount < 0) return { error: "Shipping and discount can’t be negative." };
  if (discount > subtotal + shipping) return { error: "The discount is larger than the order total." };
  const total = money(subtotal + shipping - discount);
  const createdAt = istToUtc(str(fd, "created_at"));
  const deductStock = fd.get("deduct_stock") === "on" && status !== "cancelled";
  const address = [str(fd, "address"), [str(fd, "city"), str(fd, "state"), str(fd, "pincode")].filter(Boolean).join(", ")].filter(Boolean).join("\n");

  const id = await transaction(async (d) => {
    // Re-use an existing customer with the same phone or email.
    const existing = await d.get<{ id: number; email: string | null }>(
      `SELECT id, email FROM customers WHERE ${email && phone ? "email = ? OR phone = ?" : email ? "email = ?" : "phone = ?"} ORDER BY email = ? DESC LIMIT 1`,
      ...[email, phone].filter(Boolean), email
    );
    let customerId: number;
    if (existing) {
      customerId = existing.id;
      await d.run(
        `UPDATE customers SET name = ?, phone = IF(? = '', phone, ?), city = IF(? = '', city, ?), state = IF(? = '', state, ?)${email && !existing.email ? ", email = ?" : ""} WHERE id = ?`,
        name, phone, phone, str(fd, "city"), str(fd, "city"), str(fd, "state"), str(fd, "state"), ...(email && !existing.email ? [email] : []), customerId
      );
    } else {
      customerId = (await d.run("INSERT INTO customers (name, email, phone, city, state) VALUES (?, ?, ?, ?, ?)", name, email || null, phone, str(fd, "city"), str(fd, "state"))).insertId;
    }

    const last = await d.get<{ n: number | null }>("SELECT MAX(CAST(SUBSTRING(number, 4) AS UNSIGNED)) AS n FROM orders WHERE number LIKE 'NC-%' FOR UPDATE");
    const number = `NC-${Math.max(1000, Number(last?.n ?? 0)) + 1}`;
    const orderId = (await d.run(
      `INSERT INTO orders (number, customer_id, status, payment_status, payment_method, subtotal, shipping, discount, total, shipping_address, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${createdAt ? "?" : "UTC_TIMESTAMP()"})`,
      number, customerId, status, paymentStatus, method, subtotal, shipping, discount, total, address, str(fd, "notes"), ...(createdAt ? [createdAt] : [])
    )).insertId;

    for (const it of items) {
      // Only keep product/variant links that still exist.
      const v = it.variant_id ? await d.get<{ id: number; product_id: number }>("SELECT id, product_id FROM product_variants WHERE id = ?", it.variant_id) : undefined;
      await d.run(
        "INSERT INTO order_items (order_id, product_id, variant_id, title, variant_name, price, qty) VALUES (?, ?, ?, ?, ?, ?, ?)",
        orderId, v?.product_id ?? null, v?.id ?? null, it.title, it.variant_name, it.price, it.qty
      );
      if (v && deductStock) await d.run("UPDATE product_variants SET stock = GREATEST(stock - ?, 0) WHERE id = ?", it.qty, v.id);
    }
    return orderId;
  });

  revalidatePath("/admin", "layout");
  redirect(`/admin/orders/${id}?created=1`);
}

export async function deleteOrder(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  await transaction(async (d) => {
    if (fd.get("restock") === "on") {
      const items = await d.all<{ variant_id: number | null; qty: number }>("SELECT variant_id, qty FROM order_items WHERE order_id = ?", id);
      for (const it of items) if (it.variant_id) await d.run("UPDATE product_variants SET stock = stock + ? WHERE id = ?", it.qty, it.variant_id);
    }
    await d.run("DELETE FROM orders WHERE id = ?", id);
  });
  revalidatePath("/admin", "layout");
  redirect("/admin/orders?deleted=1");
}

/* ---------- Enquiries ---------- */

const ENQUIRY_STATUSES = ["new", "contacted", "closed"];

export async function setEnquiryStatus(fd: FormData) {
  await requireAdmin();
  const status = str(fd, "status");
  if (!ENQUIRY_STATUSES.includes(status)) return;
  await run("UPDATE enquiries SET status = ? WHERE id = ?", status, Number(fd.get("id")));
  revalidatePath("/admin", "layout");
}

export async function deleteEnquiry(fd: FormData) {
  await requireAdmin();
  await run("DELETE FROM enquiries WHERE id = ?", Number(fd.get("id")));
  revalidatePath("/admin", "layout");
}

/* ---------- Settings ---------- */

const SETTING_KEYS = ["store_name", "tagline", "email", "phone", "whatsapp", "address", "gstin", "shipping_flat", "free_shipping_threshold", "low_stock_threshold"];

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  await transaction(async (d) => {
    for (const k of SETTING_KEYS) await d.run("INSERT INTO settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)", k, str(fd, k));
  });
  revalidatePath("/admin", "layout");
  redirect("/admin/settings?saved=1");
}
