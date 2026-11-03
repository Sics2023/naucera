import mysql from "mysql2/promise";
import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { seed } from "./seed";
import { CATALOG_VERSION, insertCatalog, removeDemoData, upgradeCatalogToV3, upgradeCatalogToV4, upgradeCatalogToV5, STORE_CONTACT_DEFAULTS } from "./catalog";

/**
 * MySQL / MariaDB connection (e.g. Hostinger hPanel → Databases → MySQL Databases).
 *
 * Only DB_PASSWORD is required (set it in the hosting environment variables).
 * Host, port, user and database name default to the Hostinger values in DEFAULTS below
 * and can be overridden with DB_HOST, DB_PORT, DB_USER, DB_NAME – or use a single
 *   DATABASE_URL=mysql://user:password@host:3306/dbname
 */

type Param = string | number | null | Buffer;

declare global {
  // eslint-disable-next-line no-var
  var __naucera_pool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __naucera_ready: Promise<void> | undefined;
}

/** Production database on Hostinger (not secret). Override any of these with DB_HOST / DB_PORT / DB_USER / DB_NAME. */
const DEFAULTS = {
  host: "localhost",
  port: 3306,
  user: "u993946615_naucera",
  database: "u993946615_naucera",
};

function createPool(): Pool {
  const common = {
    connectionLimit: Number(process.env.DB_POOL_SIZE || 5),
    waitForConnections: true,
    charset: "utf8mb4_unicode_ci",
    dateStrings: true as const, // return DATETIME as 'YYYY-MM-DD HH:MM:SS' (UTC)
    decimalNumbers: true, // return DECIMAL / SUM() as JS numbers
    timezone: "Z",
  };
  let pool: Pool;
  if (process.env.DATABASE_URL) {
    pool = mysql.createPool({ ...common, uri: process.env.DATABASE_URL });
  } else {
    // Non-secret defaults match the Hostinger database. The password is NEVER stored in code –
    // set DB_PASSWORD in the hosting environment variables.
    if (!process.env.DB_PASSWORD) {
      throw new Error("Database password is not configured. Add DB_PASSWORD in the environment variables.");
    }
    pool = mysql.createPool({
      ...common,
      host: process.env.DB_HOST || DEFAULTS.host,
      port: Number(process.env.DB_PORT || DEFAULTS.port),
      user: process.env.DB_USER || DEFAULTS.user,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || DEFAULTS.database,
    });
  }
  // Store and compare all timestamps in UTC.
  pool.pool.on("connection", (conn) => {
    conn.query("SET time_zone = '+00:00'");
  });
  return pool;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    slug VARCHAR(191) NOT NULL UNIQUE,
    description TEXT,
    sort INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(191) NOT NULL UNIQUE,
    short_description VARCHAR(500) NOT NULL DEFAULT '',
    description TEXT,
    category_id INT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    tags VARCHAR(500) NOT NULL DEFAULT '',
    featured TINYINT NOT NULL DEFAULT 0,
    ingredients TEXT,
    how_to_use TEXT,
    shelf_life VARCHAR(255) NOT NULL DEFAULT '',
    seo_title VARCHAR(255) NOT NULL DEFAULT '',
    seo_description VARCHAR(500) NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_products_category (category_id),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    alt VARCHAR(255) NOT NULL DEFAULT '',
    position INT NOT NULL DEFAULT 0,
    INDEX idx_images_product (product_id),
    CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS product_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    name VARCHAR(191) NOT NULL,
    sku VARCHAR(100) NOT NULL DEFAULT '',
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    compare_at_price DECIMAL(10,2) NULL,
    stock INT NOT NULL DEFAULT 0,
    weight_grams INT NOT NULL DEFAULT 0,
    position INT NOT NULL DEFAULT 0,
    INDEX idx_variants_product (product_id),
    CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL DEFAULT '',
    city VARCHAR(100) NOT NULL DEFAULT '',
    state VARCHAR(100) NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(30) NOT NULL UNIQUE,
    customer_id INT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'UPI',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_address TEXT,
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_orders_created (created_at),
    INDEX idx_orders_customer (customer_id),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NULL,
    variant_id INT NULL,
    title VARCHAR(255) NOT NULL,
    variant_name VARCHAR(191) NOT NULL DEFAULT '',
    price DECIMAL(10,2) NOT NULL,
    qty INT NOT NULL,
    INDEX idx_items_order (order_id),
    INDEX idx_items_product (product_id),
    CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    CONSTRAINT fk_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    name VARCHAR(100) PRIMARY KEY,
    value TEXT
  )`,
  // Enquiries from storefront forms (e.g. "Become a distributor").
  `CREATE TABLE IF NOT EXISTS enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kind VARCHAR(30) NOT NULL DEFAULT 'distributor',
    name VARCHAR(191) NOT NULL,
    phone VARCHAR(30) NOT NULL DEFAULT '',
    email VARCHAR(191) NOT NULL DEFAULT '',
    address VARCHAR(500) NOT NULL DEFAULT '',
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_enquiries_created (created_at)
  )`,
  // Uploaded images are stored in the database so they survive redeploys.
  `CREATE TABLE IF NOT EXISTS media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    mime VARCHAR(100) NOT NULL,
    size INT NOT NULL,
    data LONGBLOB NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

export interface Db {
  all<T>(sql: string, ...params: Param[]): Promise<T[]>;
  get<T>(sql: string, ...params: Param[]): Promise<T | undefined>;
  run(sql: string, ...params: Param[]): Promise<{ insertId: number; affectedRows: number }>;
}

function wrap(q: Pool | PoolConnection): Db {
  return {
    async all<T>(sql: string, ...params: Param[]) {
      const [rows] = await q.query<RowDataPacket[]>(sql, params);
      return rows as T[];
    },
    async get<T>(sql: string, ...params: Param[]) {
      const [rows] = await q.query<RowDataPacket[]>(sql, params);
      return rows[0] as T | undefined;
    },
    async run(sql: string, ...params: Param[]) {
      const [res] = await q.query<ResultSetHeader>(sql, params);
      return { insertId: res.insertId, affectedRows: res.affectedRows };
    },
  };
}

function pool(): Pool {
  if (!globalThis.__naucera_pool) globalThis.__naucera_pool = createPool();
  return globalThis.__naucera_pool;
}

/** Creates tables on first use and loads sample data into an empty database. */
async function ready() {
  if (!globalThis.__naucera_ready) {
    globalThis.__naucera_ready = (async () => {
      const p = pool();
      for (const stmt of SCHEMA) await p.query(stmt);
      const [rows] = await p.query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM categories");
      if (Number(rows[0].n) === 0) await tx((d) => seed(d));
      await migrateCatalog();
    })().catch((e) => {
      globalThis.__naucera_ready = undefined; // retry on next request
      throw e;
    });
  }
  return globalThis.__naucera_ready;
}

/**
 * One-time upgrade for databases created by the first version: removes the demo products,
 * customers and orders and loads the real Naucera catalogue.
 */
async function migrateCatalog() {
  await tx(async (d) => {
    const v = await d.get<{ value: string }>("SELECT value FROM settings WHERE name = 'catalog_version' FOR UPDATE");
    const current = Number(v?.value ?? 1);
    if (current >= Number(CATALOG_VERSION)) return;
    if (current < 2) {
      await removeDemoData(d);
      await insertCatalog(d);
    }
    if (current < 3) await upgradeCatalogToV3(d);
    if (current < 4) await upgradeCatalogToV4(d);
    if (current < 5) await upgradeCatalogToV5(d);
    await d.run(
      "INSERT INTO settings (name, value) VALUES ('catalog_version', ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
      CATALOG_VERSION
    );
    await d.run("UPDATE settings SET value = 'Tea, Coffee & Cooler Premixes' WHERE name = 'tagline' AND value = 'Coffee & Tea Premixes'");
    await d.run("UPDATE settings SET value = '' WHERE name = 'email' AND value = 'hello@naucera.in'");
    await d.run("UPDATE settings SET value = ? WHERE name = 'phone' AND value = '+91 00000 00000'", STORE_CONTACT_DEFAULTS.phone);
  });
}

/** Run fn inside a transaction on a single connection. */
export async function tx<T>(fn: (d: Db) => Promise<T>): Promise<T> {
  const conn = await pool().getConnection();
  try {
    await conn.beginTransaction();
    const r = await fn(wrap(conn));
    await conn.commit();
    return r;
  } catch (e) {
    await conn.rollback().catch(() => {});
    throw e;
  } finally {
    conn.release();
  }
}

export async function all<T>(sql: string, ...params: Param[]): Promise<T[]> {
  await ready();
  return wrap(pool()).all<T>(sql, ...params);
}

export async function get<T>(sql: string, ...params: Param[]): Promise<T | undefined> {
  await ready();
  return wrap(pool()).get<T>(sql, ...params);
}

export async function run(sql: string, ...params: Param[]) {
  await ready();
  return wrap(pool()).run(sql, ...params);
}

/** Transaction that first makes sure the schema exists. */
export async function transaction<T>(fn: (d: Db) => Promise<T>): Promise<T> {
  await ready();
  return tx(fn);
}
