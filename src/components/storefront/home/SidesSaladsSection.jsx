import {getLocale, getTranslations} from "next-intl/server";
import {ArrowRight, Salad, Sandwich} from "lucide-react";
import {formatPrice} from "@/lib/catalog";
import {Link} from "@/i18n/navigation";

async function SpotlightList({slug, title, items, orderLabel}) {
  const locale = await getLocale();
  const tDetails = await getTranslations("productDetails");
  const currency = tDetails("currency");

  if (items.length === 0) {
    return null;
  }

  return (
    <div aria-labelledby={`${slug}-heading`}>
      <h3
        id={`${slug}-heading`}
        className="mb-3 flex items-center gap-2 text-h4 font-bold tracking-tight sm:mb-4"
      >
        {slug === "sides" ? (
          <Sandwich className="h-5 w-5 text-brand" aria-hidden="true" />
        ) : (
          <Salad className="h-5 w-5 text-brand" aria-hidden="true" />
        )}
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/products/${item.slug}`}
              className="group flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-clay-sm transition-shadow duration-300 hover:shadow-clay-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:rounded-3xl sm:p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-caption font-bold leading-tight sm:text-body">
                  {item.name}
                </p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-muted-foreground">
                  {formatPrice(item.price, locale)} {currency}
                </p>
              </div>
              <span className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-extrabold uppercase tracking-wide text-primary-foreground shadow-clay-sm transition-colors duration-200 group-hover:bg-primary/90">
                {orderLabel}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function SidesSaladsSection({sides = [], salads = []}) {
  const t = await getTranslations("home.sidesSpotlight");

  if (sides.length === 0 && salads.length === 0) {
    return null;
  }

  return (
    <section
      className="bg-background py-section"
      aria-labelledby="sides-spotlight-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="sides-spotlight-heading"
          className="mb-6 text-h3 font-display tracking-tight sm:mb-8 sm:text-h2"
        >
          {t("title")}
        </h2>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <SpotlightList
            slug="sides"
            title={t("sidesTitle")}
            items={sides}
            orderLabel={t("orderCta")}
          />
          <SpotlightList
            slug="salads"
            title={t("saladsTitle")}
            items={salads}
            orderLabel={t("orderCta")}
          />
        </div>
      </div>
    </section>
  );
}