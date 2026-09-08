import {getTranslations} from "next-intl/server";
import {ArrowRight} from "lucide-react";
import {Link} from "@/i18n/navigation";

export async function AboutCTA() {
  const t = await getTranslations("about.cta");

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="about-cta-heading">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-14 text-center shadow-soft sm:px-12">
        <h2 id="about-cta-heading" className="text-3xl font-display tracking-tight sm:text-4xl">
          {t("title")}
        </h2>
        <Link
          href="/products"
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-extrabold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {t("button")}
          <ArrowRight className="h-5 w-5 rtl:rotate-180" />
        </Link>
      </div>
    </section>
  );
}