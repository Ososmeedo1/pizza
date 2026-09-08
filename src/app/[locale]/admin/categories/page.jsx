import {getTranslations} from "next-intl/server";
import Link from "next/link";
import {FolderTree, Pencil, Plus} from "lucide-react";
import {requireAdmin} from "@/lib/requireAdmin";
import {getAdminCategories} from "@/lib/data/adminCategories";
import {Badge} from "@/components/ui/Badge";
import {EmptyState} from "@/components/ui/EmptyState";
import {CategoryRowActions} from "@/components/admin/categories/CategoryRowActions";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("admin.categories");
  return {title: t("metaTitle")};
}

export default async function AdminCategoriesPage({params}) {
  const {locale} = await params;

  await requireAdmin(locale);

  const t = await getTranslations("admin.categories");
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-1 text-muted-foreground">{t("description")}</p>
        </div>
        <Link
          href={`/${locale}/admin/categories/new`}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus className="h-4 w-4" />
          {t("createNew")}
        </Link>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={<FolderTree className="h-8 w-8" />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <div className="space-y-3">
          <div className="hidden items-center justify-between border-b border-border pb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:flex">
            <span className="flex-1">{t("name")}</span>
            <span className="w-32 text-center">{t("status")}</span>
            <span className="shrink-0 text-end">{t("actions")}</span>
          </div>

          {categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="truncate font-bold tracking-tight">
                    {category.name.en}
                  </h3>
                  {category.name.ar ? (
                    <span className="text-sm text-muted-foreground">
                      {category.name.ar}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                  {category.slug}
                </p>
              </div>

              <div className="flex w-32 shrink-0 items-center justify-start sm:justify-center">
                <Badge variant={category.isActive ? "default" : "secondary"}>
                  {category.isActive ? t("active") : t("inactive")}
                </Badge>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                <Link
                  href={`/${locale}/admin/categories/${category.id}/edit`}
                  className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-sm font-extrabold uppercase tracking-wide transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-9 sm:rounded-lg"
                  aria-label={t("edit")}
                >
                  <Pencil className="h-4 w-4" />
                  {t("edit")}
                </Link>
                <CategoryRowActions
                  categoryId={category.id}
                  isActive={category.isActive}
                  canDelete={category.activeProductsCount === 0}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}