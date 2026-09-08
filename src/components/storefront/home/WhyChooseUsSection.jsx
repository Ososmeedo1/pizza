import {getTranslations} from "next-intl/server";
import {Flame, Phone, Wheat} from "lucide-react";

const BENEFIT_KEYS = ["freshDough", "cairoFlavors", "phoneOrdering"];

const ICONS = {
  freshDough: Wheat,
  cairoFlavors: Flame,
  phoneOrdering: Phone,
};

export async function WhyChooseUsSection() {
  const t = await getTranslations("home.whyChooseUs");

  return (
    <section className="bg-background py-section" aria-labelledby="why-choose-us-heading">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="why-choose-us-heading" className="mb-6 text-center text-h3 font-display tracking-tight sm:mb-8 sm:text-h2">
          {t("title")}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BENEFIT_KEYS.map((key) => {
            const Icon = ICONS[key];
            return (
              <div
                key={key}
                className="flex flex-col items-start gap-3 rounded-2xl bg-surface p-4 shadow-clay-sm sm:rounded-3xl sm:p-6 sm:shadow-clay-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-h4 font-bold tracking-tight">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-body leading-relaxed text-muted-foreground">
                  {t(`${key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}