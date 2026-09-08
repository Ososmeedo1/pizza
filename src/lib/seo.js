/**
 * Shared SEO helpers: canonical URLs and localized hreflang alternates.
 * Pure helpers, no I/O. Uses SITE_URL as the base origin.
 */

const LOCALES = ["ar", "en"];

function cleanPathPart(pathWithoutLocale) {
  if (!pathWithoutLocale) {
    return "";
  }
  const normalized = String(pathWithoutLocale).replace(/^\/+/, "");
  return normalized ? `/${normalized}` : "";
}

/**
 * Returns {canonical, languages} for a given locale and locale-less path.
 *
 *   seoAlternates("en", "/products/foo")
 *   => {
 *        canonical: `${URL}/en/products/foo`,
 *        languages: {
 *          "ar": `${URL}/ar/products/foo`,
 *          "en": `${URL}/en/products/foo`,
 *          "x-default": `${URL}/ar/products/foo`,
 *        },
 *      }
 */
export function seoAlternates(locale, pathWithoutLocale) {
  const base = (process.env.SITE_URL || "").replace(/\/$/, "");
  const suffix = cleanPathPart(pathWithoutLocale);
  const localeSlug = LOCALES.includes(locale) ? locale : LOCALES[0];

  const languages = {};
  for (const l of LOCALES) {
    languages[l] = `${base}/${l}${suffix}`;
  }
  languages["x-default"] = languages[LOCALES[0]];

  return {
    canonical: `${base}/${localeSlug}${suffix}`,
    languages,
  };
}

/** Absolute URL for a site path, e.g. siteUrl("/sitemap.xml"). */
export function siteUrl(path = "") {
  const base = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${cleanPathPart(path)}`;
}
