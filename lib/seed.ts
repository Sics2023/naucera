import type { Db } from "./db";
import { CATALOG_VERSION, insertCatalog, STORE_CONTACT_DEFAULTS } from "./catalog";

/** Fills an empty database with the Naucera catalogue and default store settings. */
export async function seed(d: Db) {
  await insertCatalog(d);
  const settings: Record<string, string> = {
    store_name: "Naucera",
    tagline: "Tea, Coffee & Cooler Premixes",
    email: "",
    ...STORE_CONTACT_DEFAULTS,
    gstin: "",
    currency: "INR",
    shipping_flat: "49",
    free_shipping_threshold: "499",
    low_stock_threshold: "10",
    catalog_version: CATALOG_VERSION,
  };
  for (const [k, v] of Object.entries(settings)) {
    await d.run("INSERT INTO settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = value", k, v);
  }
}
