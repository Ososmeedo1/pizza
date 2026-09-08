import {getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import {ChevronRight} from "lucide-react";
import {Badge} from "@/components/ui";
import {ProductGallery} from "@/components/storefront/ProductGallery";
import {ProductDetailsClient} from "@/components/storefront/ProductDetailsClient";
import {ProductOrderProvider} from "@/components/storefront/ProductOrderProvider";
import {ProductCard} from "@/components/storefront/ProductCard";
import {Link} from "@/i18n/navigation";
import {getProductBySlug, getRelatedProducts, getActiveProducts} from "@/lib/data/products";
import {getPublicSiteSettings} from "@/lib/data/settings";
import {getActiveAddOns} from "@/lib/data/addOns";
import {seoAlternates} from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getActiveProducts("en");
  return products.flatMap((product) => [
    {locale: "ar", slug: product.slug},
    {locale: "en", slug: product.slug},
  ]);
}

export async function generateMetadata({params}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const product = await getProductBySlug(slug, locale);

  if (!product) {
    return {};
  }

  const images = product.images?.[0]?.url ? [product.images[0].url] : [];

  return {
    title: product.name,
    description: product.description || undefined,
    alternates: seoAlternates(locale, `/products/${slug}`),
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images,
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description || undefined,
      images,
    },
  };
}

function toJsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function buildProductJsonLd(product, imageUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: imageUrl,
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      price: typeof product.price === "number" ? product.price : 0,
      availability: product.isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

export default async function ProductPage({params}) {
  const {locale, slug} = await params;

  setRequestLocale(locale);

  const product = await getProductBySlug(slug, locale);

  if (!product) {
    notFound();
  }

  const settings = await getPublicSiteSettings(locale);
  const related = await getRelatedProducts(
    product.id,
    product.category?.slug,
    locale
  );
  const addOns = await getActiveAddOns(locale);

  const t = await getTranslations("productDetails");
  const tNav = await getTranslations("navigation");
  const tProducts = await getTranslations("products");

  const labels = {
    optionsTitle: t("optionsTitle"),
    addOnsLabel: t("addOnsLabel"),
    total: t("total"),
    cta: t("cta"),
    unconfiguredChannel: t("unconfiguredChannel"),
    unitType: {
      weight: t("unitType.weight"),
      pieces: t("unitType.pieces"),
      size: t("unitType.size"),
    },
  };

  const jsonLd = buildProductJsonLd(product, product.images?.[0]?.url);

  return (
    <ProductOrderProvider
      product={product}
      addOns={addOns}
      phone={settings?.phone ?? null}
      labels={labels}
      currency={t("currency")}
      locale={locale}
    >
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-24 sm:px-6 sm:pb-8 lg:px-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: toJsonLd(jsonLd)}}
          suppressHydrationWarning
        />
        <nav
        aria-label={t("breadcrumbs")}
        className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link
          href="/"
          className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          {tNav("home")}
        </Link>
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        <Link
          href="/products"
          className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          {tProducts("title")}
        </Link>
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        <span className="max-w-[16rem] truncate text-foreground">
          {product.name}
        </span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col gap-6">
          {product.isAvailable === false ? (
            <Badge variant="secondary" className="w-fit">
              {tProducts("unavailable")}
            </Badge>
          ) : null}
          {product.isNewItem ? (
            <Badge variant="default" className="w-fit shadow-clay-sm">
              {tProducts("new")}
            </Badge>
          ) : null}

          <h1 className="text-h2 font-display tracking-tight">
            {product.name}
          </h1>

          {product.description ? (
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          ) : null}

          <ProductDetailsClient
            product={product}
            labels={labels}
            currency={t("currency")}
            locale={locale}
          />
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16 space-y-6" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-h3 font-display tracking-tight">
            {t("relatedTitle")}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      ) : null}
      </div>
    </ProductOrderProvider>
  );
}