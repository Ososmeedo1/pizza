import {getTranslations, setRequestLocale} from "next-intl/server";
import {HeroSection} from "@/components/storefront/home/HeroSection";
import {FeaturedPizzasSection} from "@/components/storefront/home/FeaturedPizzasSection";
import {CategoriesSection} from "@/components/storefront/home/CategoriesSection";
import {SidesSaladsSection} from "@/components/storefront/home/SidesSaladsSection";
import {WhyChooseUsSection} from "@/components/storefront/home/WhyChooseUsSection";
import {SocialSection} from "@/components/storefront/home/SocialSection";
import {ContactCTASection} from "@/components/storefront/home/ContactCTASection";
import {getActiveCategories} from "@/lib/data/categories";
import {
  getActiveProducts,
  getFeaturedProducts,
} from "@/lib/data/products";
import {getPublicSiteSettings} from "@/lib/data/settings";
import {seoAlternates} from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  return [{locale: "ar"}, {locale: "en"}];
}

export async function generateMetadata({params}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
    alternates: seoAlternates(locale, "/"),
  };
}

const MAX_SPOTLIGHT_ITEMS = 4;

const PIZZA_SUBCATEGORY_SLUGS = new Set([
  "vegetarian-pizza",
  "cheese-pizza",
  "chicken-pizza",
  "meat-pizza",
  "seafood-pizza",
]);

export default async function HomePage({params}) {
  const {locale} = await params;

  setRequestLocale(locale);

  const [featuredProducts, activeProducts, categories, settings] =
    await Promise.all([
      getFeaturedProducts(locale),
      getActiveProducts(locale),
      getActiveCategories(locale),
      getPublicSiteSettings(locale),
    ]);

  const heroImages = [...featuredProducts, ...activeProducts]
    .filter((product) => product.image?.url)
    .reduce((acc, product) => {
      if (acc.length >= 2 || acc.some((entry) => entry.url === product.image.url)) {
        return acc;
      }
      acc.push({url: product.image.url, alt: product.name});
      return acc;
    }, []);

  const topLevelCategories = categories.filter((category) => !category.parent);

  const pizzaStyles = categories.filter((category) =>
    PIZZA_SUBCATEGORY_SLUGS.has(category.slug)
  );

  const moreCategories = topLevelCategories.filter(
    (category) => category.slug !== "pizzas"
  );

  const pick = (source, categorySlug) =>
    source
      .filter((product) => product.category?.slug === categorySlug)
      .slice(0, MAX_SPOTLIGHT_ITEMS);

  const sides = pick(activeProducts, "sides");
  const salads = pick(activeProducts, "salads");

  return (
    <div>
      <HeroSection heroImages={heroImages} />
      <FeaturedPizzasSection products={featuredProducts} />
      <CategoriesSection pizzaStyles={pizzaStyles} moreCategories={moreCategories} />
      <SidesSaladsSection sides={sides} salads={salads} />
      <WhyChooseUsSection />
      <SocialSection settings={settings} />
      <ContactCTASection settings={settings} />
    </div>
  );
}