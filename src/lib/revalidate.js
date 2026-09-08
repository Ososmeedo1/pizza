import {revalidatePath} from "next/cache";

const LOCALES = ["ar", "en"];

function safeRevalidate(path) {
  try {
    revalidatePath(path);
  } catch (error) {
    console.warn(
      `revalidate: failed for ${path} (${
        error instanceof Error ? error.message : String(error)
      })`
    );
  }
}

/**
 * Product mutations. Home and the products listing embed product data; the
 * product detail page itself carries product-specific markup and metadata.
 * Old and new slugs are both revalidated so a slug rename clears the stale
 * path immediately (and the renamed detail page is rebuilt on demand).
 */
export function revalidateProductPaths({oldSlug, newSlug}) {
  const paths = [];

  for (const locale of LOCALES) {
    paths.push(`/${locale}`);
    paths.push(`/${locale}/products`);
  }

  for (const slug of [oldSlug, newSlug]) {
    if (!slug) {
      continue;
    }
    for (const locale of LOCALES) {
      paths.push(`/${locale}/products/${slug}`);
    }
  }

  // Category pages listing this product are covered by their own 300s TTL;
  // the sitemap must refresh so search engines see new product URLs promptly.
  paths.push("/sitemap.xml");

  for (const path of paths) {
    safeRevalidate(path);
  }
}

/**
 * Category mutations. Categories embed the category detail page and home
 * (home renders category links whenever the storefront is served).
 */
export function revalidateCategoryPaths({slug}) {
  const paths = [];

  for (const locale of LOCALES) {
    paths.push(`/${locale}`);
    if (slug) {
      paths.push(`/${locale}/categories/${slug}`);
    }
  }

  paths.push("/sitemap.xml");

  for (const path of paths) {
    safeRevalidate(path);
  }
}

/**
 * Settings mutations. Header/footer render on every cached page, so the
 * product-independent cached pages (home, about, contact) are rebuilt for
 * both locales. Product/category detail pages do NOT embed settings except
 * metadata and the WhatsApp CTA on product pages — they get freshness from
 * their own 300s TTL backstop, so we keep the invalidation set conservative
 * (/, /about, /contact) instead of rebuilding the whole site on every
 * settings save.
 */
export function revalidateSettingsPaths() {
  const paths = [];

  for (const locale of LOCALES) {
    paths.push(`/${locale}`);
    paths.push(`/${locale}/about`);
    paths.push(`/${locale}/contact`);
  }

  for (const path of paths) {
    safeRevalidate(path);
  }
}

/**
 * Add-on mutations. The add-ons listing (/categories/add-ons), the home page
 * and the products listing all render catalog data that reflects add-ons, and
 * the sitemap must list the add-ons category. Product detail pages embed
 * add-ons with a size-dependent price, but they get freshness from their own
 * 300s TTL backstop, so we keep the invalidation set conservative.
 */
export function revalidateAddOnPaths() {
  const paths = [];

  for (const locale of LOCALES) {
    paths.push(`/${locale}/categories/add-ons`);
    paths.push(`/${locale}`);
    paths.push(`/${locale}/products`);
  }

  paths.push("/sitemap.xml");

  for (const path of paths) {
    safeRevalidate(path);
  }
}