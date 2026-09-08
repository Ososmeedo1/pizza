import {getTranslations, setRequestLocale} from "next-intl/server";
import {ContactHero} from "@/components/storefront/contact/ContactHero";
import {ContactInfo} from "@/components/storefront/contact/ContactInfo";
import {BranchesSection} from "@/components/storefront/contact/BranchesSection";
import {getPublicSiteSettings} from "@/lib/data/settings";
import {seoAlternates} from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  return [{locale: "ar"}, {locale: "en"}];
}

export async function generateMetadata({params}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
    alternates: seoAlternates(locale, "/contact"),
  };
}

export default async function ContactPage({params}) {
  const {locale} = await params;

  setRequestLocale(locale);

  const settings = await getPublicSiteSettings(locale);

  const t = await getTranslations("contact");

  return (
    <div>
      <ContactHero />

      {settings?.contactMessage ? (
        <section
          className="mx-auto w-full max-w-7xl px-4 py-16 pb-6 sm:px-6 lg:px-8"
          aria-label={t("message")}
        >
          <div className="rounded-3xl border border-border bg-surface px-6 py-8 text-center shadow-soft">
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-foreground">
              {settings.contactMessage}
            </p>
          </div>
        </section>
      ) : null}

      <ContactInfo settings={settings} />
      <BranchesSection settings={settings} />
    </div>
  );
}