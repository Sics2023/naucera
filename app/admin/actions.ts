"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkCredentials, createSession, destroySession, requireAdmin, adminEmail } from "@/lib/auth";
import { get, run, tx } from "@/lib/db";
import { slugify, ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/format";

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

function uniqueSlug(base: string, table: "products" | "categories", excludeId?: number) {
  let slug = base || "item";
  let n = 1;
  while (get(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`, slug, excludeId ?? -1)) slug = `${base}-${++n}`;
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

  const slug = uniqueSlug(slugify(str(fd, "slug") || title), "products", id);
  const fields = [
    title, slug, str(fd, "short_description"), str(fd, "description"),
    Number(fd.get("category_id")) || null, ["active", "draft", "archived"].includes(str(fd, "status")) ? str(fd, "status") : "draft",
    str(fd, "tags"), fd.get("featured") ? 1 : 0, str(fd, "ingredients"), str(fd, "how_to_use"), str(fd, "shelf_life"),
    str(fd, "seo_title"), str(fd, "seo_description"),
  ] as const;

  const productId = tx((d) => {
    let pid = id;
    if (pid) {
      d.prepare(
        `UPDATE products SET title=?, slug=?, short_description=?, description=?, category_id=?, status=?, tags=?, featured=?,
         ingredients=?, how_to_use=?, shelf_life=?, seo_title=?, seo_description=?, updated_at=datetime('now') WHERE id=?`
      ).run(...fields, pid);
    } else {
      pid = Number(
        d.prepare(
          `INSERT INTO products (title, slug, short_description, description, category_id, status, tags, featured,
           ingredients, how_to_use, shelf_life, seo_title, seo_description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
        ).run(...fields).lastInsertRowid
      );
    }

    // Variants: update existing, insert new, delete removed (keeps order history linked).
    const keep = variants.filter((v) => v.id).map((v) => Number(v.id));
    d.prepare(`DELETE FROM product_variants WHERE product_id = ? ${keep.length ? `AND id NOT IN (${keep.map(() => "?").join(",")})` : ""}`).run(pid, ...keep);
    variants.forEach((v, i) => {
      const vals = [
        String(v.name).trim(), String(v.sku ?? "").trim(), Number(v.price),
        v.compare_at_price === "" || v.compare_at_price == null ? null : Number(v.compare_at_price),
        Math.max(0, Math.floor(Number(v.stock) || 0)), Math.floor(Number(v.weight_grams) || 0), i,
      ] as const;
      if (v.id) d.prepare("UPDATE product_variants SET name=?, sku=?, price=?, compare_at_price=?, stock=?, weight_grams=?, position=? WHERE id=? AND product_id=?").run(...vals, Number(v.id), pid);
      else d.prepare("INSERT INTO product_variants (name, sku, price, compare_at_price, stock, weight_grams, position, product_id) VALUES (?,?,?,?,?,?,?,?)").run(...vals, pid);
    });

    d.prepare("DELETE FROM product_images WHERE product_id = ?").run(pid);
    images.forEach((img, i) => {
      if (img.url) d.prepare("INSERT INTO product_images (product_id, url, alt, position) VALUES (?,?,?,?)").run(pid, img.url, img.alt ?? title, i);
    });
    return pid;
  });

  revalidatePath("/admin", "layout");
  redirect(`/admin/products/${productId}?saved=1`);
}

export async function deleteProduct(fd: FormData) {
  await requireAdmin();
  run("DELETE FROM products WHERE id = ?", Number(fd.get("id")));
  revalidatePath("/admin", "layout");
  redirect("/admin/products?deleted=1");
}

export async function duplicateProduct(fd: FormData) {
  await requireAdmin();
  const src = Number(fd.get("id"));
  const newId = tx((d) => {
    const p = d.prepare("SELECT * FROM products WHERE id = ?").get(src) as Record<string, string | number | null> | undefined;
    if (!p) throw new Error("Product not found");
    const title = `${p.title} (Copy)`;
    const pid = Number(
      d.prepare(
        `INSERT INTO products (title, slug, short_description, description, category_id, status, tags, featured, ingredients, how_to_use, shelf_life, seo_title, seo_description)
         SELECT ?, ?, short_description, description, category_id, 'draft', tags, 0, ingredients, how_to_use, shelf_life, seo_title, seo_description FROM products WHERE id = ?`
      ).run(title, uniqueSlug(slugify(title), "products"), src).lastInsertRowid
    );
    d.prepare("INSERT INTO product_variants (product_id, name, sku, price, compare_at_price, stock, weight_grams, position) SELECT ?, name, sku, price, compare_at_price, 0, weight_grams, position FROM product_variants WHERE product_id = ?").run(pid, src);
    d.prepare("INSERT INTO product_images (product_id, url, alt, position) SELECT ?, url, alt, position FROM product_images WHERE product_id = ?").run(pid, src);
    return pid;
  });
  revalidatePath("/admin", "layout");
  redirect(`/admin/products/${newId}?saved=1`);
}

export async function setProductStatus(fd: FormData) {
  await requireAdmin();
  const status = str(fd, "status");
  if (!["active", "draft", "archived"].includes(status)) return;
  run("UPDATE products SET status = ?, updated_at = datetime('now') WHERE id = ?", status, Number(fd.get("id")));
  revalidatePath("/admin", "layout");
}

/* ---------- Inventory ---------- */

export async function updateStock(fd: FormData) {
  await requireAdmin();
  tx((d) => {
    for (const [k, v] of fd.entries()) {
      const m = /^stock_(\d+)$/.exec(k);
      if (m) d.prepare("UPDATE product_variants SET stock = ? WHERE id = ?").run(Math.max(0, Math.floor(Number(v) || 0)), Number(m[1]));
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
  const slug = uniqueSlug(slugify(str(fd, "slug") || name), "categories", id);
  if (id) run("UPDATE categories SET name=?, slug=?, description=? WHERE id=?", name, slug, str(fd, "description"), id);
  else run("INSERT INTO categories (name, slug, description, sort) VALUES (?, ?, ?, (SELECT COALESCE(MAX(sort),0)+1 FROM categories))", name, slug, str(fd, "description"));
  revalidatePath("/admin", "layout");
  redirect("/admin/categories?saved=1");
}

export async function deleteCategory(fd: FormData) {
  await requireAdmin();
  run("DELETE FROM categories WHERE id = ?", Number(fd.get("id")));
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
  run("UPDATE orders SET status = ?, payment_status = ?, notes = ? WHERE id = ?", status, payment, str(fd, "notes"), id);
  revalidatePath("/admin", "layout");
  redirect(`/admin/orders/${id}?saved=1`);
}

/* ---------- Settings ---------- */

const SETTING_KEYS = ["store_name", "tagline", "email", "phone", "address", "gstin", "shipping_flat", "free_shipping_threshold", "low_stock_threshold"];

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  tx((d) => {
    for (const k of SETTING_KEYS) d.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(k, str(fd, k));
  });
  revalidatePath("/admin", "layout");
  redirect("/admin/settings?saved=1");
}
