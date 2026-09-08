import {getTranslations} from "next-intl/server";
import {ArrowRight, Flame} from "lucide-react";
import {ProductCard} from "@/components/storefront/ProductCard";
import {EmptyState} from "@/components/ui";
import {Link} from "@/i18n/navigation";

export async function FeaturedPizzasSection({products = []}) {
  const t = await getTranslations("home.featured");

  return (
    <section
      className="bg-background py-section"
      aria-labelledby="featured-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
          <h2
            id="featured-heading"
            className="text-h3 font-display tracking-tight sm:text-h2"
          >
            {t("title")}
          </h2>
          <Link
            href="/products"
            className="-mx-1 -my-2 inline-flex items-center gap-1.5 rounded-sm px-1 py-2 text-sm font-extrabold uppercase tracking-wide text-brand transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("viewAll")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={<Flame className="h-10 w-10" />}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                showCategory
                showOrder
                orderLabel={t("orderCta")}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}