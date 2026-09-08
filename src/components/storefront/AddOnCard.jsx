import {getLocale, getTranslations} from "next-intl/server";
import {Sparkles} from "lucide-react";
import {formatPrice} from "@/lib/catalog";

function sizePriceLine(addOn, locale) {
  return ["S", "M", "L"]
    .map((key) =>
      typeof addOn.sizePrices?.[key] === "number"
        ? `${key} ${formatPrice(addOn.sizePrices[key], locale)}`
        : null
    )
    .filter(Boolean)
    .join(" · ");
}

export async function AddOnCard({addOn}) {
  const locale = await getLocale();
  const tDetails = await getTranslations("productDetails");

  const currency = tDetails("currency");
  const priceLine =
    addOn.priceMode === "flat"
      ? `${formatPrice(addOn.price, locale)} ${currency}`
      : sizePriceLine(addOn, locale);

  return (
    <div className="flex h-full flex-col gap-2 rounded-2xl bg-surface p-4 shadow-clay-sm sm:rounded-3xl sm:p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-brand">
        <Sparkles className="h-6 w-6 rtl:-scale-x-100" />
      </div>
      <h3 className="text-caption font-bold leading-tight sm:text-body">
        {addOn.name}
      </h3>
      <p className="mt-auto truncate text-sm font-semibold tabular-nums text-muted-foreground">
        {priceLine}
      </p>
    </div>
  );
}