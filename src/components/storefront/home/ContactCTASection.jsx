import {getTranslations} from "next-intl/server";
import {Mail, MapPin, Phone} from "lucide-react";
import {Link} from "@/i18n/navigation";
import {normalizePhone} from "@/lib/utils";

export async function ContactCTASection({settings}) {
  const t = await getTranslations("home.contactCta");

  const phoneHref = normalizePhone(settings?.phone);
  const address = settings?.branches?.[0]?.address || null;

  return (
    <section className="bg-background py-section" aria-labelledby="contact-cta-heading">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-surface px-5 py-10 text-center shadow-clay-md sm:px-12 sm:py-14">
          <h2 id="contact-cta-heading" className="text-h3 font-display tracking-tight sm:text-h2">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-body leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
          {address ? (
            <p className="mx-auto mt-3 inline-flex items-center justify-center gap-2 text-body leading-relaxed text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{address}</span>
            </p>
          ) : null}
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            {phoneHref ? (
              <a
                href={`tel:${phoneHref}`}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-extrabold uppercase tracking-wide text-primary-foreground shadow-clay-md transition-colors hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
              >
                <Phone className="h-5 w-5" />
                {t("callButton")}
              </a>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-muted px-8 text-base font-extrabold uppercase tracking-wide text-muted-foreground sm:w-auto"
              >
                <Phone className="h-5 w-5" />
                {t("unconfiguredChannel")}
              </span>
            )}
            <Link
              href="/contact"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-8 text-base font-extrabold uppercase tracking-wide transition-colors hover:bg-muted hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
            >
              <Mail className="h-5 w-5" />
              {t("contactButton")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}