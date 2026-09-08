import Image from "next/image";
import {getTranslations} from "next-intl/server";
import {Clock, Heart, MapPin, Phone} from "lucide-react";
import {Link} from "@/i18n/navigation";
import {cn} from "@/lib/utils";
import {normalizePhone} from "@/lib/utils";

const DEVELOPER_WHATSAPP = "01060683508";

function InstagramIcon({className}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({className}) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function telHref(value) {
  const normalized = normalizePhone(value);
  return normalized ? `tel:${normalized}` : null;
}

function socialHref(value, base) {
  const v = (value || "").trim();
  if (!v) {
    return null;
  }
  if (/^https?:\/\//i.test(v)) {
    return v;
  }
  return `${base}${v.replace(/^@/, "")}`;
}

function linkClass() {
  return "inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm";
}

export async function Footer({settings = null}) {
  const tNav = await getTranslations("navigation");
  const tFooter = await getTranslations("footer");
  const tCommon = await getTranslations("common");

  const brandName = settings?.brandName || tCommon("appName");
  const navLinks = [
    {href: "/", label: tNav("home")},
    {href: "/products", label: tNav("products")},
    {href: "/about", label: tNav("about")},
    {href: "/contact", label: tNav("contact")},
  ];

  const devNumber = DEVELOPER_WHATSAPP.replace(/[^\d]/g, "");
  const creditHref = devNumber ? `https://wa.me/${devNumber}` : "#";
  const creditClasses =
    "inline-flex items-center gap-1.5 text-xs text-muted-foreground rounded-sm";
  const instagramHref = settings?.instagram
    ? socialHref(settings.instagram, "https://instagram.com/")
    : null;
  const facebookHref = settings?.facebook
    ? socialHref(settings.facebook, "https://facebook.com/")
    : null;
  const firstBranch = settings?.branches?.[0] || null;
  const addressLine = firstBranch?.address || null;
  const phoneHref = telHref(settings?.phone);
  const showContact = Boolean(phoneHref);
  const showSocials = Boolean(instagramHref || facebookHref);
  const showVisit = Boolean(addressLine || settings?.openingHours);

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          {settings?.logo?.url ? (
            <div className="flex items-center gap-3">
              <Image
                src={settings.logo.url}
                alt={settings.logo.alt || brandName}
                width={144}
                height={36}
                sizes="144px"
                className="h-9 w-auto object-contain"
              />
              <span className="text-lg font-display">{brandName}</span>
            </div>
          ) : (
            <span className="text-lg font-display">{brandName}</span>
          )}
          {settings?.contactMessage ? (
            <p className="text-sm text-muted-foreground">{settings.contactMessage}</p>
          ) : null}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wide">{tFooter("links")}</h2>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass()}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {(showContact || showSocials) && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold tracking-wide">{tFooter("contact")}</h2>
            <ul className="space-y-2">
              {phoneHref ? (
                <li>
                  <a href={phoneHref} className={linkClass()}>
                    <Phone className="h-4 w-4" />
                    <span dir="ltr">{settings.phone}</span>
                  </a>
                </li>
              ) : null}
            </ul>
            {showSocials ? (
              <div className="pt-1">
                <p className="mb-2 text-sm font-semibold">{tFooter("followUs")}</p>
                <div className="flex items-center gap-3">
                  {instagramHref ? (
                    <a
                      href={instagramHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={tFooter("instagram")}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <InstagramIcon className="h-4 w-4" />
                    </a>
                  ) : null}
                  {facebookHref ? (
                    <a
                      href={facebookHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={tFooter("facebook")}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <FacebookIcon className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {showVisit ? (
          <div className="space-y-3">
            {addressLine ? (
              <>
                <h2 className="text-sm font-semibold tracking-wide">
                  {tFooter("address")}
                </h2>
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{addressLine}</span>
                </p>
              </>
            ) : null}
            {settings?.openingHours ? (
              <>
                <h2 className="text-sm font-semibold tracking-wide">
                  {tFooter("openingHours")}
                </h2>
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{settings.openingHours}</span>
                </p>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="border-t border-border/30 pt-6 pb-6">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-caption text-muted-foreground">
          <span>{tFooter("rights", {year: String(new Date().getFullYear()), name: brandName})}</span>
          <span aria-hidden="true" className="text-muted-foreground/50">•</span>
          {devNumber ? (
            <a
              href={creditHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                creditClasses,
                "transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <Heart className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{tFooter("madeBy")}</span>
            </a>
          ) : (
            <span className={creditClasses}>
              <Heart className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{tFooter("madeBy")}</span>
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}