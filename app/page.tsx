import { redirect } from "next/navigation";

// Until a dedicated homepage is built, the store opens on the product range.
export default function Home() {
  redirect("/products");
}
