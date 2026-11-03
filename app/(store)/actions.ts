"use server";

import { get, run } from "@/lib/db";

export type EnquiryState = { ok?: boolean; error?: string; fields?: Record<string, string> } | undefined;

const str = (fd: FormData, k: string, max: number) => String(fd.get(k) ?? "").trim().slice(0, max);

/** Public "Become a distributor" form. Saved to the enquiries table and listed in Admin → Enquiries. */
export async function submitDistributorEnquiry(_: EnquiryState, fd: FormData): Promise<EnquiryState> {
  const fields = {
    name: str(fd, "name", 191),
    phone: str(fd, "phone", 30),
    email: str(fd, "email", 191),
    address: str(fd, "address", 500),
    message: str(fd, "message", 3000),
  };
  // Honeypot: real visitors never see or fill this field.
  if (str(fd, "website", 200)) return { ok: true };

  if (!fields.name) return { error: "Please enter your name.", fields };
  const digits = fields.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) return { error: "Please enter a valid phone number.", fields };
  if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return { error: "Please enter a valid email address.", fields };
  if (!fields.address) return { error: "Please enter your address or city.", fields };

  // Ignore accidental double submits of the same phone number within a few minutes.
  const recent = await get("SELECT id FROM enquiries WHERE phone = ? AND created_at > UTC_TIMESTAMP() - INTERVAL 5 MINUTE", fields.phone);
  if (!recent) {
    await run(
      "INSERT INTO enquiries (kind, name, phone, email, address, message, created_at) VALUES ('distributor', ?, ?, ?, ?, ?, UTC_TIMESTAMP())",
      fields.name, fields.phone, fields.email, fields.address, fields.message
    );
  }
  return { ok: true };
}
