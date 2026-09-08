import {getTranslations} from "next-intl/server";
import {requireAdmin} from "@/lib/requireAdmin";
import {getAdminCategoryOptions} from "@/lib/data/adminProducts";
import {ProductForm} from "@/components/admin/products/ProductForm";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("admin.productForm");
  return {title: t("createTitle")};
}

export default async function NewProductPage({params}) {
  const {locale} = await params;

  await requireAdmin(locale);

  const t = await getTranslations("admin.productForm");
  const categories = await getAdminCategoryOptions();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("createTitle")}
      </h2>
      <ProductForm mode="create" categories={categories} locale={locale} />
    </div>
  );
}