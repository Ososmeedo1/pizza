import { Cairo, Montserrat, Rye } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import { getPublicSiteSettings } from "@/lib/data/settings";
import { siteUrl } from "@/lib/seo";
import { SkipLink } from "@/components/layout/SkipLink";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeFix } from "@/components/ThemeFix";
import { ThemeNavGuard } from "@/components/ThemeNavGuard";
import "../globals.css";

const rye = Rye({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rye",
});

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const cairo = Cairo({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "arabic"],
  display: "swap",
  variable: "--font-cairo",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const settings = await getPublicSiteSettings(locale);

  const openGraphImage = settings?.logo?.url ? [settings.logo.url] : [];

  return {
    metadataBase: new URL(siteUrl()),
    ...(settings?.favicon?.url
      ? {icons: {icon: settings.favicon.url}}
      : {}),
    ...(openGraphImage.length > 0
      ? {
          openGraph: {
            images: openGraphImage,
            locale,
            type: "website",
          },
          twitter: {
            card: "summary_large_image",
            images: openGraphImage,
          },
        }
      : {}),
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  setRequestLocale(locale);

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const settings = await getPublicSiteSettings(locale);

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${montserrat.variable} ${cairo.variable} ${rye.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeFix />
        <ThemeNavGuard />
        <NextIntlClientProvider>
          <SkipLink />
          <Header settings={settings} />
          <main id="main-content" tabIndex={-1} className="w-full flex-1">
            {children}
          </main>
          <Footer settings={settings} />
        </NextIntlClientProvider>
        <Toaster
          position="top-center"
          richColors
          dir={locale === "ar" ? "rtl" : "ltr"}
        />
      </body>
    </html>
  );
}