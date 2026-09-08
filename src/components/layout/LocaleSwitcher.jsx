"use client";

import {useLocale, useTranslations} from "next-intl";
import {Languages} from "lucide-react";
import {routing} from "@/i18n/routing";
import {usePathname, useRouter} from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("lang");
  const pathname = usePathname();
  const router = useRouter();

  const other = routing.locales.find((item) => item !== locale) || "en";

  function switchLocale() {
    router.replace(pathname, {locale: other});
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      aria-label={t("switchTo")}
      className="inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-xl px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-2.5"
    >
      <Languages className="h-4 w-4" />
      <span className="hidden sm:inline">{other === "ar" ? t("arabic") : t("english")}</span>
    </button>
  );
}