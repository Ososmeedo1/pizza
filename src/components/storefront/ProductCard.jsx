import Image from "next/image";
import {getTranslations} from "next-intl/server";
import {getLocale} from "next-intl/server";
import {Pizza} from "lucide-react";
import {Link} from "@/i18n/navigation";
import {Badge} from "@/components/ui";

function formatNumber(value, locale) {
  const numberLocale = locale === "ar" ? "ar-u-nu-latn" : locale;
  return new Intl.NumberFormat(numberLocale, {maximumFractionDigits: 2}).format(
    value
  );
}

/**
 * Storefront product card.
 *
 * - always: name, display price, unavailable/New badges on the image block.
 * - `showCategory`: renders a small category chip under the name.
 * - `showOrder`: renders a primary "Order" pill as the card's bottom CTA.
 *
 * The whole card is a single link to the product page, so the CTA is a
 * visual affordance rather than a nested interactive element.
 */
export async function ProductCard({
  product,
  showCategory = false,
  showOrder = false,
  orderLabel = undefined,
}) {
  const locale = await getLocale();
  const t = await getTranslations("products");

  const price = formatNumber(product.price, locale);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface shadow-clay-sm transition-shadow duration-300 hover:shadow-clay-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:rounded-3xl"
    >
      <div className="relative aspect-square overflow-hidden bg-muted sm:aspect-[4/5]">
        {product.image?.url ? (
          <Image
            src={product.image.url}
            alt={product.image.alt || product.name || ""}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 md:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Pizza className="h-8 w-8 text-brand/50" />
          </div>
        )}
        {product.isAvailable === false ? (
          <Badge
            variant="secondary"
            className="absolute start-2 top-2 z-10 px-2 py-0.5 text-[10px]"
          >
            {t("unavailable")}
          </Badge>
        ) : null}
        {product.isNewItem ? (
          <Badge
            variant="default"
            className="absolute end-2 top-2 z-10 px-2 py-0.5 text-[10px] shadow-clay-sm"
          >
            {t("new")}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        <h3 className="line-clamp-2 text-caption font-bold leading-tight sm:text-body">
          {product.name}
        </h3>
        {showCategory && product.category ? (
          <span className="w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-brand sm:text-[11px]">
            {product.category.name}
          </span>
        ) : null}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-1.5 pt-1">
          <span className="text-base font-bold tabular-nums text-foreground sm:text-lg">
            {product.hasMeasuringUnit
              ? t("fromPrice", {price})
              : t("price", {price})}
          </span>
        </div>
        {showOrder ? (
          <span className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-extrabold uppercase tracking-wide text-primary-foreground shadow-clay-sm transition-colors duration-200 group-hover:bg-primary/90">
            {orderLabel}
          </span>
        ) : null}
      </div>
    </Link>
  );
}