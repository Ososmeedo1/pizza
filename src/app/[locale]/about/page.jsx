import {getTranslations, setRequestLocale} from "next-intl/server";
import {AboutHero} from "@/components/storefront/about/AboutHero";
import {AboutContent} from "@/components/storefront/about/AboutContent";
import {AboutCTA} from "@/components/storefront/about/AboutCTA";
import {seoAlternates} from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  return [{locale: "ar"}, {locale: "en"}];
}

export async function generateMetadata({params}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
    alternates: seoAlternates(locale, "/about"),
  };
}

export default async function AboutPage({params}) {
  const {locale} = await params;

  setRequestLocale(locale);

  return (
    <div>
      <AboutHero />
      <AboutContent />
      <AboutCTA />
    </div>
  );
}