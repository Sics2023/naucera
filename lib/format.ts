export const inr = (n: number | null | undefined) =>
  n == null ? "—" : "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: Number(n) % 1 ? 2 : 0 });

export const fmtDate = (s: string) =>
  new Date(s.replace(" ", "T") + "Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const fmtDateTime = (s: string) =>
  new Date(s.replace(" ", "T") + "Z").toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
export const PAYMENT_STATUSES = ["pending", "paid", "refunded"] as const;
export const PAYMENT_METHODS = ["Cash", "UPI", "Bank transfer", "Cash on delivery", "Card", "Credit (pay later)"] as const;
