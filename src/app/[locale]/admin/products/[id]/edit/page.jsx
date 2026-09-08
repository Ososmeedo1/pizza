import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {requireAdmin} from "@/lib/requireAdmin";
import {
  getAdminProductById,
  getAdminCategoryOptions,
} from "@/lib/data/adminProducts";
import {ProductForm} from "@/components/admin/products/ProductForm";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("admin.productForm");
  return {title: t("editTitle")};
}

export default async function EditProductPage({params}) {
  const {locale, id} = await params;

  await requireAdmin(locale);

  const t = await getTranslations("admin.productForm");
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getAdminCategoryOptions(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("editTitle")}
      </h2>
      <ProductForm
        mode="edit"
        product={product}
        categories={categories}
        locale={locale}
      />
    </div>
  );
}