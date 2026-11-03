import { redirect } from "next/navigation";

// The customer-facing storefront will live here. For now, go straight to the admin.
export default function Home() {
  redirect("/admin");
}
