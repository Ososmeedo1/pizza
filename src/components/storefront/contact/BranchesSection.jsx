import {getTranslations} from "next-intl/server";
import {MapPin, Phone} from "lucide-react";
import {normalizePhone} from "@/lib/utils";

function normalizedPhoneHref(value) {
  const normalized = normalizePhone(value);
  return normalized ? `tel:${normalized}` : null;
}

export async function BranchesSection({settings}) {
  const t = await getTranslations("contact.branches");

  const branches = settings?.branches ?? [];
  const globalPhone = settings?.phone || null;
  const contactMessage = settings?.contactMessage || null;

  const legacyCard =
    branches.length === 0 && settings?.brandName
      ? [
          {
            id: "legacy",
            name: settings.brandName,
            address: null,
            phone: globalPhone,
            mapUrl: null,
            message: contactMessage,
          },
        ]
      : [];

  const cards = branches.length > 0 ? branches : legacyCard;

  if (cards.length === 0) {
    return null;
  }

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
      aria-labelledby="branches-heading"
    >
      <h2 id="branches-heading" className="text-h3 font-display tracking-tight sm:text-h2">
        {t("title")}
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {cards.map((branch, index) => {
          const callHref = normalizedPhoneHref(branch.phone || globalPhone);
          const hasCall = Boolean(callHref);
          const hasDirections = Boolean(branch.mapUrl);

          return (
            <div
              key={branch.id ?? `branch-${index}`}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-soft"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-brand">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold tracking-tight">
                  {branch.name || ""}
                </h3>
              </div>

              {branch.address ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {branch.address}
                </p>
              ) : null}

              {branch.message ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {branch.message}
                </p>
              ) : null}

              {hasDirections || hasCall ? (
                <div className="flex flex-wrap items-center gap-3">
                  {hasDirections ? (
                    <a
                      href={branch.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-primary/25 bg-surface px-5 text-sm font-extrabold uppercase tracking-wide text-foreground transition duration-200 hover:-translate-y-0.5 hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-primary-bright/30"
                    >
                      <MapPin className="h-4 w-4" />
                      {t("directions")}
                    </a>
                  ) : null}
                  {hasCall ? (
                    <a
                      href={callHref}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-extrabold uppercase tracking-wide transition-colors hover:border-input hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <Phone className="h-4 w-4" />
                      {t("call")}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}