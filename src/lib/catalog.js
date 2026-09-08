/**
 * Pure catalog helpers shared by server data layers and server components.
 * No I/O, no React, no side effects.
 */

export function localizeField(field, locale) {
  if (typeof field === "string") {
    return field;
  }
  return field?.[locale] ?? field?.ar ?? null;
}

/**
 * Number formatting shared by the storefront: Western digits for Arabic so
 * prices render like "230 ج.م" instead of Arabic-Indic numerals, matching the
 * design's example copy.
 */
export function formatPrice(value, locale) {
  const numberLocale = locale === "ar" ? "ar-u-nu-latn" : locale;
  return new Intl.NumberFormat(numberLocale, {maximumFractionDigits: 2}).format(
    value
  );
}

function activeMeasuringUnitOptions(product) {
  if (!product || !Array.isArray(product.measuringUnit?.options)) {
    return [];
  }
  return product.measuringUnit.options.filter((option) => option.isActive !== false);
}

/**
 * True when the product exposes a measuring unit with selectable options that
 * set the price shown on the card — i.e. it should display a "From {price}"
 * label.
 */
export function hasSelectablePricedOptions(product) {
  return (
    product?.hasMeasuringUnit === true &&
    activeMeasuringUnitOptions(product).length > 0
  );
}

/**
 * Display price: the lowest active measuring-unit option price when one
 * exists, otherwise the product base price.
 */
export function getProductDisplayPrice(product) {
  const basePrice = typeof product?.price === "number" ? product.price : 0;

  const absolutePrices = activeMeasuringUnitOptions(product)
    .filter((option) => typeof option.price === "number")
    .map((option) => option.price);

  return absolutePrices.length > 0 ? Math.min(...absolutePrices) : basePrice;
}

/**
 * Primary product image: the image flagged isPrimary, else the first image.
 * Returns {url, alt} with localized alt, or null when there is no image.
 */
export function getPrimaryProductImage(product, locale = "en") {
  const images = Array.isArray(product.images) ? product.images : [];
  if (images.length === 0) {
    return null;
  }

  const primary = images.find((image) => image.isPrimary) || images[0];

  if (!primary?.url) {
    return null;
  }

  return {
    url: primary.url,
    alt: localizeField(primary.alt, locale) ?? "",
  };
}