import Image from "next/image";
import {getTranslations} from "next-intl/server";
import {ChevronRight, Pizza, Sandwich, UtensilsCrossed} from "lucide-react";
import {Link} from "@/i18n/navigation";
import {CategoryIconTile} from "@/components/storefront/CategoryIconTile";

const FALLBACK_ICONS = {
  pizzas: Pizza,
  "add-ons": Sandwich,
};

function CategoryFallback({slug}) {
  const Icon = FALLBACK_ICONS[slug] ?? UtensilsCrossed;
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted text-brand">
      <Icon className="h-10 w-10 text-brand/60" />
    </div>
  );
}

function TopLevelCategoryCard({category}) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative aspect-square overflow-hidden rounded-2xl bg-surface shadow-clay-sm transition-shadow duration-300 hover:shadow-clay-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:aspect-[4/5] sm:rounded-3xl"
    >
      {category.image?.url ? (
        <Image
          src={category.image.url}
          alt={category.image.alt || category.name || ""}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 md:group-hover:scale-105"
        />
      ) : (
        <CategoryFallback slug={category.slug} />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent"
      />
      <div className="absolute bottom-0 start-0 end-0 p-3 sm:p-4">
        <h3 className="line-clamp-2 text-caption font-bold leading-tight text-background sm:text-body">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}

function PizzaStyleCard({category}) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-clay-md transition-shadow duration-300 hover:shadow-clay-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:rounded-3xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <CategoryIconTile
          slug={category.slug}
          iconColorClassName="text-primary dark:text-primary-bright"
          iconClassName="h-10 w-10 sm:h-12 sm:w-12"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-2 text-caption font-bold leading-tight sm:text-body">
          {category.name}
        </h3>
        {category.description ? (
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {category.description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function GroupHeading({title, viewAllHref, t}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
      <h2 className="text-h3 font-display tracking-tight sm:text-h2">
        {title}
      </h2>
      {viewAllHref ? (
        <Link
          href={viewAllHref}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80 dark:text-primary-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-body"
        >
          {t("viewAll")}
          <ChevronRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:-translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </div>
  );
}

export async function CategoriesSection({pizzaStyles = [], moreCategories = []}) {
  const t = await getTranslations("home.categories");

  if (pizzaStyles.length === 0 && moreCategories.length === 0) {
    return null;
  }

  return (
    <section
      className="bg-background py-section"
      aria-label={t("ariaLabel")}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {pizzaStyles.length > 0 ? (
          <div>
            <GroupHeading
              t={t}
              title={t("pizzaStylesTitle")}
              viewAllHref="/categories/pizzas"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 md:gap-6">
              {pizzaStyles.map((category) => (
                <PizzaStyleCard key={category.slug} category={category} />
              ))}
            </div>
          </div>
        ) : null}

        {moreCategories.length > 0 ? (
          <div className="mt-10">
            <GroupHeading t={t} title={t("moreCategoriesTitle")} />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {moreCategories.map((category) => (
                <TopLevelCategoryCard key={category.slug} category={category} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}