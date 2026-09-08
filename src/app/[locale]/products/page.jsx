import {getTranslations, setRequestLocale} from "next-intl/server";
import {PackageOpen} from "lucide-react";
import {EmptyState} from "@/components/ui/EmptyState";
import {Pagination} from "@/components/ui/Pagination";
import {ProductCard} from "@/components/storefront/ProductCard";
import {AddOnCard} from "@/components/storefront/AddOnCard";
import {StorefrontProductFilters} from "@/components/storefront/StorefrontProductFilters";
import {getStoreProducts} from "@/lib/data/products";
import {getActiveCategories} from "@/lib/data/categories";
import {getGroupedMenu} from "@/lib/data/menu";
import {seoAlternates} from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({params, searchParams}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations("products");
  const sp = await searchParams;
  const page = Number.parseInt(sp?.page, 10);

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
    alternates: seoAlternates(locale, "/products"),
    ...(Number.isFinite(page) && page > 1
      ? {robots: {index: false, follow: true}}
      : {}),
  };
}

export default async function ProductsPage({params, searchParams}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations("products");
  const tAddOns = await getTranslations("addOnsListing");

  const sp = await searchParams;
  const search = typeof sp?.search === "string" ? sp.search : "";
  const category = typeof sp?.category === "string" ? sp.category : "";
  const page = typeof sp?.page === "string" ? sp.page : undefined;

  const isSearchMode = Boolean(search.trim() || category);

  const [categories, result, menu] = await Promise.all([
    getActiveCategories(locale),
    isSearchMode
      ? getStoreProducts(
          {search, categorySlug: category, page, pageSize: 12},
          locale
        )
      : Promise.resolve(null),
    isSearchMode ? Promise.resolve(null) : getGroupedMenu(locale),
  ]);

  const products = result?.items ?? [];

  const navItems = [];
  for (const section of menu?.sections ?? []) {
    navItems.push({slug: section.category.slug, label: section.category.name});
  }
  if (menu?.addOns?.length) {
    navItems.push({slug: "add-ons", label: tAddOns("title")});
  }

  const hasMenuItems = (menu?.sections?.length ?? 0) > 0 || (menu?.addOns?.length ?? 0) > 0;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-2">
        <h1 className="text-h2 font-display tracking-tight">{t("title")}</h1>
        <p className="max-w-2xl text-muted-foreground">{t("subtitle")}</p>
      </div>

      <StorefrontProductFilters
        categories={categories}
        initialSearch={search}
        initialCategory={category}
      />

      {isSearchMode ? (
        <>
          <p role="status" className="mb-4 text-sm text-muted-foreground">
            {t("resultsCount", {count: result?.total ?? 0})}
          </p>

          {products.length === 0 ? (
            <EmptyState
              icon={<PackageOpen className="h-10 w-10" />}
              title={t("emptyTitle")}
              description={t("emptyDescription")}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}

          <Pagination
            page={result?.page ?? 1}
            totalPages={result?.totalPages ?? 1}
            namespace="products.pagination"
          />
        </>
      ) : !hasMenuItems ? (
        <EmptyState
          icon={<PackageOpen className="h-10 w-10" />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <>
          {navItems.length > 1 ? (
            <div className="sticky top-14 z-30 -mx-4 mt-8 border-y border-border/40 bg-surface/95 px-4 py-2 backdrop-blur-md sm:top-16 sm:px-6 lg:top-20 lg:px-8">
              <nav
                aria-label={t("menuNavLabel")}
                className="overflow-x-auto md:overflow-visible"
              >
                <ul className="flex w-max gap-2 pb-0.5 md:mx-auto md:w-auto md:flex-wrap md:justify-center">
                  {navItems.map((item) => (
                    <li key={item.slug}>
                      <a
                        href={`#sec-${item.slug}`}
                        aria-label={t("jumpNav", {section: item.label})}
                        className="inline-flex h-11 items-center whitespace-nowrap rounded-full border border-border bg-background px-4 text-sm font-bold text-muted-foreground transition-colors hover:border-input hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ) : null}

          <div className="mt-10 space-y-14">
            {menu.sections.map((section) =>
              section.type === "group" ? (
                <section
                  key={section.category.slug}
                  id={`sec-${section.category.slug}`}
                  aria-labelledby={`menu-heading-${section.category.slug}`}
                  className="scroll-mt-32 scroll-pb-8 lg:scroll-mt-36"
                >
                  <div className="mb-6 space-y-2">
                    <h2
                      id={`menu-heading-${section.category.slug}`}
                      className="text-2xl font-display tracking-tight"
                    >
                      {section.category.name}
                    </h2>
                    {section.category.description ? (
                      <p className="max-w-2xl text-muted-foreground">
                        {section.category.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-10">
                    {section.children.map((child) => (
                      <div key={child.category.slug}>
                        <h3 className="mb-1.5 text-lg font-display font-bold tracking-tight">
                          {child.category.name}
                        </h3>
                        {child.category.description ? (
                          <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
                            {child.category.description}
                          </p>
                        ) : null}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6 lg:grid-cols-3">
                          {child.items.map((product) => (
                            <ProductCard key={product.slug} product={product} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <section
                  key={section.category.slug}
                  id={`sec-${section.category.slug}`}
                  aria-labelledby={`menu-heading-${section.category.slug}`}
                  className="scroll-mt-32 scroll-pb-8 lg:scroll-mt-36"
                >
                  <div className="mb-6 space-y-2">
                    <h2
                      id={`menu-heading-${section.category.slug}`}
                      className="text-2xl font-display tracking-tight"
                    >
                      {section.category.name}
                    </h2>
                    {section.category.description ? (
                      <p className="max-w-2xl text-muted-foreground">
                        {section.category.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6 lg:grid-cols-3">
                    {section.items.map((product) => (
                      <ProductCard key={product.slug} product={product} />
                    ))}
                  </div>
                </section>
              )
            )}

            {menu.addOns.length > 0 ? (
              <section
                id="sec-add-ons"
                aria-labelledby="menu-heading-add-ons"
                className="scroll-mt-32 scroll-pb-8 lg:scroll-mt-36"
              >
                <div className="mb-6 space-y-2">
                  <h2
                    id="menu-heading-add-ons"
                    className="text-2xl font-display tracking-tight"
                  >
                    {tAddOns("title")}
                  </h2>
                  <p className="max-w-2xl text-muted-foreground">
                    {tAddOns("description")}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6 lg:grid-cols-3">
                  {menu.addOns.map((addOn) => (
                    <AddOnCard key={addOn.id} addOn={addOn} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}