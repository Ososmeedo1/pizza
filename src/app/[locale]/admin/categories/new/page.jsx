import {getTranslations} from "next-intl/server";
import {requireAdmin} from "@/lib/requireAdmin";
import {getAdminParentCategoryOptions} from "@/lib/data/adminCategories";
import {CategoryForm} from "@/components/admin/categories/CategoryForm";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("admin.categoryForm");
  return {title: t("createTitle")};
}

export default async function NewCategoryPage({params}) {
  const {locale} = await params;

  await requireAdmin(locale);

  const t = await getTranslations("admin.categoryForm");
  const parentCategories = await getAdminParentCategoryOptions();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("createTitle")}
      </h2>
      <CategoryForm
        mode="create"
        parentCategories={parentCategories}
        locale={locale}
      />
    </div>
  );
}