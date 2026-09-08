import {getTranslations} from "next-intl/server";
import Link from "next/link";
import {Plus, ShoppingBag} from "lucide-react";
import {requireAdmin} from "@/lib/requireAdmin";
import {getAdminProducts} from "@/lib/data/adminProducts";
import {getAdminCategoryOptions} from "@/lib/data/adminProducts";
import {Badge} from "@/components/ui/Badge";
import {EmptyState} from "@/components/ui/EmptyState";
import {Pagination} from "@/components/ui/Pagination";
import {ProductFilters} from "@/components/admin/products/ProductFilters";
import {ProductRowActions} from "@/components/admin/products/ProductRowActions";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("admin.products");
  return {title: t("metaTitle")};
}

export default async function AdminProductsPage({params, searchParams}) {
  const {locale} = await params;
  const {search, category, availability, page} = await searchParams;

  await requireAdmin(locale);

  const t = await getTranslations("admin.products");
  const [result, categories] = await Promise.all([
    getAdminProducts({
      search: search || undefined,
      category: category || undefined,
      availability: availability || undefined,
      page: page || undefined,
      pageSize: 10,
    }),
    getAdminCategoryOptions(),
  ]);

  const {items: products} = result;

  const thumbnail = (product) => {
    if (!product.image) {
      return (
        <div
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40"
        >
          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
        </div>
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.image.url}
        alt={product.image.alt?.en || product.name.en}
        className="h-14 w-14 shrink-0 rounded-xl border border-border object-cover"
      />
    );
  };

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
          href={`/${locale}/admin/products/new`}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus className="h-4 w-4" />
          {t("createNew")}
        </Link>
      </div>

      <ProductFilters
        locale={locale}
        categories={categories}
        defaultSearch={search || ""}
        defaultCategory={category || ""}
      />

      {products.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {thumbnail(product)}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="truncate font-bold tracking-tight">
                      {product.name.en}
                    </h3>
                    {product.name.ar ? (
                      <span className="text-sm text-muted-foreground">
                        {product.name.ar}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                    {product.category?.name?.en || "—"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm font-medium sm:justify-end">
                <span className="tabular-nums">
                  {product.price} {t("currency")}
                </span>
                <span className="sr-only">—</span>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? t("active") : t("inactive")}
                </Badge>
                {product.isFeatured ? (
                  <Badge variant="outline">{t("featured")}</Badge>
                ) : null}
                <Badge
                  variant={
                    product.isAvailable ? "outline" : "destructive"
                  }
                >
                  {product.isAvailable ? t("available") : t("soldOut")}
                </Badge>
              </div>

              <div className="sm:w-auto">
                <ProductRowActions
                  productId={product.id}
                  isActive={product.isActive}
                  isFeatured={product.isFeatured}
                  locale={locale}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        namespace="admin.products.pagination"
      />
    </div>
  );
}