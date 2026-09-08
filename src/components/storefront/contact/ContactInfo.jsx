import {getTranslations} from "next-intl/server";
import {Clock, Mail, Phone} from "lucide-react";
import {ContactCard} from "./ContactCard";
import {normalizePhone} from "@/lib/utils";

function telHref(value) {
  const normalized = normalizePhone(value);
  return normalized ? `tel:${normalized}` : null;
}

export async function ContactInfo({settings}) {
  const t = await getTranslations("contact.info");

  const phone = settings?.phone || null;
  const callHref = telHref(phone);
  const email = settings?.email || null;
  const openingHours = settings?.openingHours || null;
  const mailHref = email ? `mailto:${email}` : null;

  const hasAny = Boolean(phone || email || openingHours);

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
      aria-labelledby="contact-info-heading"
    >
      <h2 id="contact-info-heading" className="sr-only">
        {t("title")}
      </h2>

      {!hasAny ? (
        <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-muted-foreground">
          {t("unavailable")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {phone ? (
            <ContactCard
              icon={<Phone className="h-6 w-6" />}
              title={t("phone")}
              href={callHref}
            >
              <span dir="ltr">{phone}</span>
            </ContactCard>
          ) : null}

          {email ? (
            <ContactCard
              icon={<Mail className="h-6 w-6" />}
              title={t("email")}
              href={mailHref}
            >
              <span>{email}</span>
            </ContactCard>
          ) : null}

          {openingHours ? (
            <ContactCard icon={<Clock className="h-6 w-6" />} title={t("openingHours")}>
              <span>{openingHours}</span>
            </ContactCard>
          ) : null}
        </div>
      )}
    </section>
  );
}