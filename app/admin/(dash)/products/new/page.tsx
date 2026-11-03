import { listCategories } from "@/lib/queries";
import { PageHeader } from "@/components/ui";
import ProductForm from "@/components/ProductForm";

export const metadata = { title: "Add product" };

export default function NewProduct() {
  return (
    <>
      <PageHeader title="Add product" back={{ href: "/admin/products", label: "Products" }} />
      <ProductForm categories={listCategories()} />
    </>
  );
}
