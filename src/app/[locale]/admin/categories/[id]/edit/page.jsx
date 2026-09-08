import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {requireAdmin} from "@/lib/requireAdmin";
import {
  getAdminCategoryById,
  getAdminParentCategoryOptions,
} from "@/lib/data/adminCategories";
import {CategoryForm} from "@/components/admin/categories/CategoryForm";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("admin.categoryForm");
  return {title: t("editTitle")};
}

export default async function EditCategoryPage({params}) {
  const {locale, id} = await params;

  await requireAdmin(locale);

  const t = await getTranslations("admin.categoryForm");
  const [category, parentCategories] = await Promise.all([
    getAdminCategoryById(id),
    getAdminParentCategoryOptions({excludeId: id}),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("editTitle")}
      </h2>
      <CategoryForm
        mode="edit"
        category={category}
        parentCategories={parentCategories}
        locale={locale}
      />
    </div>
  );
}