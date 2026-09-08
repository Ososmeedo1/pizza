import {getTranslations} from "next-intl/server";

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

function socialHref(value, prefix) {
  if (!value) {
    return null;
  }
  if (/^https?:\/\//.test(value)) {
    return value;
  }
  // Handles bare handles ("@handle") and plain usernames.
  return `${prefix}${value.replace(/^@/, "")}`;
}

export async function SocialSection({settings}) {
  const t = await getTranslations("home.social");
  const tFooter = await getTranslations("footer");

  const instagramHref = settings?.instagram
    ? socialHref(settings.instagram, "https://instagram.com/")
    : null;
  const facebookHref = settings?.facebook
    ? socialHref(settings.facebook, "https://facebook.com/")
    : null;

  const hasSocials = Boolean(instagramHref || facebookHref);

  if (!hasSocials) {
    return null;
  }

  return (
    <section className="bg-background py-section text-center" aria-labelledby="social-heading">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="social-heading" className="mb-6 text-h3 font-display tracking-tight sm:text-h2">
          {t("title")}
        </h2>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          {instagramHref ? (
            <a
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 text-sm font-extrabold uppercase tracking-wide text-muted-foreground transition-colors hover:border-input hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
            >
              <InstagramIcon className="h-5 w-5" />
              {tFooter("instagram")}
            </a>
          ) : null}
          {facebookHref ? (
            <a
              href={facebookHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 text-sm font-extrabold uppercase tracking-wide text-muted-foreground transition-colors hover:border-input hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
            >
              <FacebookIcon className="h-5 w-5" />
              {tFooter("facebook")}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}