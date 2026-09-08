import Image from "next/image";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import {ChevronRight, PackageOpen} from "lucide-react";
import {EmptyState, Pagination} from "@/components/ui";
import {AddOnCard} from "@/components/storefront/AddOnCard";
import {ProductCard} from "@/components/storefront/ProductCard";
import {CategoryIconTile} from "@/components/storefront/CategoryIconTile";
import {Link} from "@/i18n/navigation";
import {getActiveCategories, getCategoryPageData} from "@/lib/data/categories";
import {getActiveAddOns} from "@/lib/data/addOns";
import {getPublicSiteSettings} from "@/lib/data/settings";
import {seoAlternates} from "@/lib/seo";

export const revalidate = 300;

const ADD_ONS_SLUG = "add-ons";

export async function generateStaticParams() {
  const categories = await getActiveCategories("en");
  return categories.flatMap((category) => [
    {locale: "ar", slug: category.slug},
    {locale: "en", slug: category.slug},
  ]);
}

const PAGE_SIZE = 12;

export async function generateMetadata({params, searchParams}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const rawPage = Number.parseInt(sp?.page, 10);
  const isPaginated = Number.isFinite(rawPage) && rawPage > 1;

  const base = isPaginated ? {robots: {index: false, follow: true}} : {};

  if (slug === ADD_ONS_SLUG) {
    const tAddOns = await getTranslations("addOnsListing");
    return {
      title: tAddOns("metaTitle"),
      description: tAddOns("metaDescription"),
      alternates: seoAlternates(locale, `/categories/${ADD_ONS_SLUG}`),
      ...base,
    };
  }

  const data = await getCategoryPageData(slug, locale, {page: 1, pageSize: PAGE_SIZE});
  if (!data) {
    return {...base};
  }

  const settings = await getPublicSiteSettings(locale);
  const brand = settings?.brandName || "PIZZATO";

  return {
    title: `${data.category.name} | ${brand}`,
    description: data.category.description || undefined,
    alternates: seoAlternates(locale, `/categories/${slug}`),
    openGraph: {
      title: `${data.category.name} | ${brand}`,
      description: data.category.description || undefined,
      images: data.category.image?.url ? [data.category.image.url] : [],
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.category.name} | ${brand}`,
      description: data.category.description || undefined,
      images: data.category.image?.url ? [data.category.image.url] : [],
    },
    ...base,
  };
}

export default async function CategoryPage({params, searchParams}) {
  const {locale, slug} = await params;

  setRequestLocale(locale);

  const t = await getTranslations("categoryPage");
  const tAddOns = await getTranslations("addOnsListing");

  const sp = await searchParams;
  const page = typeof sp?.page === "string" ? sp.page : undefined;

  const renderBreadcrumbs = (currentName) => (
    <nav
      aria-label={t("breadcrumbs")}
      className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
    >
      <Link
        href="/"
        className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t("breadcrumbHome")}
      </Link>
      <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      <Link
        href="/products"
        className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t("breadcrumbCategories")}
      </Link>
      <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      <span className="max-w-[16rem] truncate text-foreground">
        {currentName}
      </span>
    </nav>
  );

  if (slug === ADD_ONS_SLUG) {
    const addOns = await getActiveAddOns(locale);

    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {renderBreadcrumbs(tAddOns("title"))}

        <header className="mt-6">
          <h1 id="add-ons-heading" className="text-h2 font-display tracking-tight">
            {tAddOns("title")}
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            {tAddOns("description")}
          </p>
        </header>

        <section className="mt-12" aria-labelledby="add-ons-heading">
          {addOns.length === 0 ? (
            <EmptyState
              icon={<PackageOpen className="h-10 w-10" />}
              title={tAddOns("emptyTitle")}
              description={tAddOns("emptyDescription")}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {addOns.map((addOn) => (
                <AddOnCard key={addOn.id} addOn={addOn} />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  const data = await getCategoryPageData(slug, locale, {page, pageSize: PAGE_SIZE});

  if (!data) {
    notFound();
  }

  const {category, group, children, pagination} = data;
  const products = pagination.items;
  const hasChips = children.length > 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {renderBreadcrumbs(category.name)}

      <header className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start">
        <div className="space-y-4">
          <h1 className="text-h2 font-display tracking-tight">
            {category.name}
          </h1>
          {category.description ? (
            <p className="max-w-2xl whitespace-pre-line leading-relaxed text-muted-foreground">
              {category.description}
            </p>
          ) : null}
        </div>

        {category.parent ? (
          <div className="relative aspect-square w-full max-w-[11rem] overflow-hidden rounded-2xl bg-muted shadow-clay-md lg:justify-self-end">
            <CategoryIconTile slug={category.slug} iconClassName="h-14 w-14" />
          </div>
        ) : category.image ? (
          <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-muted shadow-clay-md">
            <Image
              src={category.image.url}
              alt={category.image.alt || category.name || ""}
              fill
              priority
              sizes="(min-width: 1024px) 24rem, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}
      </header>

      {hasChips ? (
        <nav
          aria-label={t("chipsLabel")}
          className="-mx-4 mt-8 overflow-x-auto px-4 pb-1 md:-mx-0 md:flex-wrap md:overflow-x-visible md:px-0"
        >
          <ul className="flex w-max gap-2 md:w-auto md:flex-wrap">
            <li>
              <Chip href={`/categories/${group.slug}`} active={group.slug === slug}>
                {t("allCategories")}
              </Chip>
            </li>
            {children.map((child) => (
              <li key={child.slug}>
                <Chip
                  href={`/categories/${child.slug}`}
                  active={child.slug === slug}
                >
                  {child.name}
                </Chip>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <section className="mt-10" aria-labelledby="category-products-heading">
        {products.length === 0 ? (
          <EmptyState
            icon={<PackageOpen className="h-10 w-10" />}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </section>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        namespace="products.pagination"
      />
    </div>
  );
}

function Chip({href, active, children}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "inline-flex h-11 items-center whitespace-nowrap rounded-full bg-primary px-5 text-sm font-extrabold uppercase tracking-wide text-primary-foreground shadow-clay-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          : "inline-flex h-11 items-center whitespace-nowrap rounded-full border border-border bg-surface px-5 text-sm font-bold text-muted-foreground transition-colors hover:border-input hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      }
    >
      {children}
    </Link>
  );
}