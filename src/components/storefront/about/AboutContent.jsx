import {getTranslations} from "next-intl/server";
import {Pizza} from "lucide-react";

export async function AboutContent() {
  const t = await getTranslations("about.content");

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="about-content-heading"
    >
      <div className="grid items-start gap-10 lg:grid-cols-2">
        <div className="space-y-10">
          <div className="space-y-4">
            <h2 id="about-content-heading" className="text-3xl font-display tracking-tight">
              {t("storyTitle")}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {t("storyParagraph1")}
            </p>
            <p className="leading-relaxed text-muted-foreground">
              {t("storyParagraph2")}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold tracking-tight">
              {t("philosophyTitle")}
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              {t("philosophyParagraph")}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold tracking-tight">
              {t("qualityTitle")}
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              {t("qualityParagraph")}
            </p>
          </div>
        </div>

        <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-border bg-panel-wash shadow-soft">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Pizza className="h-16 w-16 text-brand/70" />
            <span className="text-sm font-medium">{t("illustrationLabel")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}