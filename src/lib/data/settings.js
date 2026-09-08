import {cache} from "react";
import {connectDB} from "@/lib/db";
import {SiteSettings} from "@/models/SiteSettings";

function pickLocale(value, locale) {
  if (typeof value === "string") return value;
  return value?.[locale] ?? value?.ar ?? null;
}

/**
 * Reads the public site settings used by the storefront shell.
 *
 * Server-safe and layout-safe: never throws and returns null whenever the
 * database is unavailable (missing MONGODB_URI, connection failure, or no
 * seeded document). All localized fields are resolved for the current locale
 * and only plain, serializable data is returned (never raw docs or _id).
 */
export const getPublicSiteSettings = cache(async function getPublicSiteSettings(locale) {
  if (!process.env.MONGODB_URI) {
    return null;
  }

  try {
    await connectDB();

    const doc = await SiteSettings.findOne({singletonKey: "site"}).lean();

    if (!doc) {
      return null;
    }

    const brandName = pickLocale(doc.brandName, locale);
    const logo = doc.logo?.url
      ? {url: doc.logo.url, alt: pickLocale(doc.logo.alt, locale) ?? brandName}
      : null;
    const favicon = doc.favicon?.url
      ? {url: doc.favicon.url, alt: pickLocale(doc.favicon.alt, locale) ?? brandName}
      : null;
    const branches = Array.isArray(doc.branches)
      ? doc.branches
          .map((branch) => ({
            name: pickLocale(branch.name, locale),
            address: branch.address ? pickLocale(branch.address, locale) : null,
            phone: branch.phone || null,
            mapUrl: branch.mapUrl || null,
          }))
          .filter((branch) => branch.name)
      : [];

    return {
      brandName,
      logo,
      favicon,
      phone: doc.phone || null,
      email: doc.email || null,
      branches,
      instagram: doc.instagram || null,
      facebook: doc.facebook || null,
      openingHours: pickLocale(doc.openingHours, locale),
      contactMessage: pickLocale(doc.contactMessage, locale),
      mapEmbedUrl: doc.mapEmbedUrl || null,
      mapLatitude: typeof doc.mapLatitude === "number" ? doc.mapLatitude : null,
      mapLongitude: typeof doc.mapLongitude === "number" ? doc.mapLongitude : null,
    };
  } catch (error) {
    console.warn(
      `getPublicSiteSettings: database unavailable, falling back to defaults (${
        error instanceof Error ? error.message : String(error)
      })`
    );
    return null;
  }
});