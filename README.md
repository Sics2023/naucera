# Naucera – Coffee & Tea Premix Store

The new Naucera online store, built with Next.js. This first part is the **store admin dashboard**, which works like the Shopify or WooCommerce admin. The customer-facing storefront comes next and will share the same database.

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

> **Sample data:** on first start the app fills the database with a sample catalogue of 15 coffee and tea premixes, customers and about 3 months of orders. This lets the dashboard show realistic numbers in a demo. The product pack images are generated illustrations. Replace them with real product photos from the admin, or run `npm run reset-db` to start over.

## Run it locally

You need **Node.js 22.13 or newer**. The app uses Node's built-in SQLite, so there's no database server to install.

```bash
npm install
cp .env.example .env.local   # then change the admin password and SESSION_SECRET
npm run dev
```

Open http://localhost:3000/admin and sign in.

Default demo login (change it in `.env.local`):

- Email: `admin@naucera.in`
- Password: `naucera@123`

For a production build:

```bash
npm run build && npm start
```

## Tech

- Next.js 15 (App Router, Server Actions), React 19, TypeScript and Tailwind CSS 4
- SQLite via `node:sqlite`. The database and uploaded images are stored in `DATA_DIR` (default `./data`, which git ignores).
- Admin sessions use an HMAC-signed, httpOnly cookie.

### Project layout

```
app/admin/login            Sign-in page
app/admin/(dash)/...       Dashboard, products, inventory, categories, orders, customers, settings
app/admin/actions.ts       All create/update/delete server actions
app/api/admin/upload       Image upload endpoint
app/api/admin/export       Products CSV export
app/uploads/[...path]      Serves uploaded images
lib/db.ts                  Database connection + schema
lib/seed.ts                Sample data
components/                Shared UI (sidebar, product form, chart, ...)
```

### Deploying

The app needs a server with a **persistent disk** for the SQLite file and uploaded images. A VPS, Railway, Render with a disk, or Fly.io with a volume all work. Set `DATA_DIR` to the mounted disk. For Vercel or other serverless hosting, move the data layer in `lib/db.ts` to Postgres and store images in S3 or Cloudinary.

## Roadmap

1. ✅ Admin dashboard
2. Storefront: home, category, product, cart and checkout pages, styled to the Naucera brand
3. Payments (Razorpay or UPI) and order emails or WhatsApp notifications
4. Discount codes, GST invoices and shipping integration (Shiprocket)
