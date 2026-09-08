import {getTranslations} from "next-intl/server";

export async function ContactHero() {
  const t = await getTranslations("contact.hero");

  return (
    <section className="bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 text-center sm:px-6 sm:py-16 lg:px-8">
        <h1 className="mx-auto max-w-3xl text-h1 font-display tracking-tight sm:text-display">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-body leading-relaxed text-muted-foreground sm:text-body-lg">
          {t("subtitle")}
        </p>
      </div>
    </section>
  );
}