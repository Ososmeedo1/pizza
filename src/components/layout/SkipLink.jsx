"use client";

import {useTranslations} from "next-intl";

export function SkipLink() {
  const t = useTranslations("navigation");

  const handleClick = (event) => {
    if (event.defaultPrevented) {
      return;
    }
    const main = document.getElementById("main-content");
    if (main) {
      event.preventDefault();
      main.focus();
      main.scrollIntoView();
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="sr-only z-[60] rounded-xl bg-primary px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:start-4"
    >
      {t("skipToContent")}
    </a>
  );
}