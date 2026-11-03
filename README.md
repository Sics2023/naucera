# Naucera – Coffee & Tea Premix Store

The new Naucera online store, built with Next.js. This first part is the **store admin dashboard**, which works like the Shopify or WooCommerce admin. The customer-facing storefront comes next and will share the same database.

![Dashboard](docs/screenshots/2-dashboard.png)

More screenshots are in [`docs/screenshots`](docs/screenshots).

## Admin features

| Area | What you can do |
|---|---|
| **Home** | Revenue, orders, average order value and customer stats for the last 30 days, compared with the 30 days before. Daily revenue chart, list of orders to fulfil, low-stock alerts, recent orders and top products. |
| **Products** | Add, edit, duplicate and delete products. Upload several images by drag-and-drop and reorder them (the first image is the cover). Each product can have pack-size variants such as 250 g, 500 g and 1 kg, each with its own price, MRP, SKU, stock and weight. Products also have ingredients, preparation steps, shelf life, tags, a category, a featured flag, a status (active, draft or archived) and SEO fields with a Google preview. You can search, filter and export to CSV. |
| **Inventory** | Update stock for every variant from one screen, with low-stock and out-of-stock filters. |
| **Categories** | Create, edit and delete collections, for example Coffee Premix, Tea Premix or Vending. |
| **Orders** | Filter orders by status or payment and search them. Each order has a detail page with its items, totals, customer, shipping address, a fulfilment progress bar, status and payment updates, and internal notes such as courier or AWB numbers. |
| **Customers** | A searchable list showing each customer's order count, total spend and last order. |
| **Settings** | Store details, GSTIN, flat shipping rate, free-shipping threshold and the low-stock threshold. |

The admin is protected by a login, and it works on both desktop and mobile.

> **Catalogue:** on first start, the app loads the Naucera product list (`lib/catalog.ts`, taken from *Naucera_Product_List.xlsx*). That's 14 products in 3 categories (Tea, Coffee and Cooler Premixes), with 1 kg and single-serve sachet pack sizes. The sheet had no prices or stock, so products are created as **Draft** with "Price not set". Add prices and stock in the admin, then set each product to Active. Product images are generated placeholders; replace them with real photos.

## Database

The app uses **MySQL / MariaDB**, for example the database included with Hostinger hosting. Tables are created automatically on first start. Uploaded product images are also stored in the database (`media` table), so they survive redeploys.

### Hostinger setup

1. In hPanel, go to **Databases → MySQL Databases** and create a database and user. Note the database name, username and password.
2. In your Node.js app's **Environment variables**, add:

| Key | Value |
|---|---|
| `DB_PASSWORD` | your database password (required, never commit it to GitHub) |
| `ADMIN_EMAIL` | admin login email |
| `ADMIN_PASSWORD` | admin login password |
| `SESSION_SECRET` | a long random string |

   The database host, name and user default to `localhost` / `u993946615_naucera` (see `DEFAULTS` in `lib/db.ts`). Override them with `DB_HOST`, `DB_PORT`, `DB_NAME` and `DB_USER` if they change.

3. Redeploy, then open `/admin`.

You can use a single `DATABASE_URL=mysql://user:password@host:3306/dbname` instead of the separate `DB_*` variables. Special characters in the password must then be URL-encoded.

## Run it locally

You need Node.js 20 or newer and a MySQL or MariaDB database.

```bash
npm install
cp .env.example .env.local   # fill in the DB_* values and admin password
npm run dev
```

Open http://localhost:3000/admin and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

For a production build:

```bash
npm run build && npm start
```

## Tech

- Next.js 15 (App Router, Server Actions), React 19, TypeScript and Tailwind CSS 4
- MySQL / MariaDB via `mysql2`. Prices are stored as `DECIMAL`, timestamps in UTC.
- Admin sessions use an HMAC-signed, httpOnly cookie.

### Project layout

```
app/admin/login            Sign-in page
app/admin/(dash)/...       Dashboard, products, inventory, categories, orders, customers, settings
app/admin/actions.ts       All create/update/delete server actions
app/api/admin/upload       Image upload endpoint (stores images in MySQL)
app/api/admin/export       Products CSV export
app/uploads/[...path]      Serves uploaded images
lib/db.ts                  MySQL connection + schema
lib/seed.ts                Sample data
components/                Shared UI (sidebar, product form, chart, ...)
```

## Roadmap

1. ✅ Admin dashboard
2. Storefront: home, category, product, cart and checkout pages, styled to the Naucera brand
3. Payments (Razorpay or UPI) and order emails or WhatsApp notifications
4. Discount codes, GST invoices and shipping integration (Shiprocket)
