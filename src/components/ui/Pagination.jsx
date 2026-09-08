"use client";

import {Suspense, useCallback} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useTranslations} from "next-intl";

/**
 * Client-side pagination: a numbered `<select>` jumping between pages.
 *
 * - Renders "Page" label + `<select>` (1..totalPages) + "of {totalPages}".
 * - On change it `router.push`es the same pathname with every existing search
 *   param preserved, `page` swapped to the chosen value, then scrolls to top.
 * - Renders nothing when `totalPages <= 1`.
 * - `namespace` holds `label`, `pageLabel` and `ofLabel` (e.g.
 *   `products.pagination`, `admin.products.pagination`).
 * - Wrapped in its own Suspense boundary so it stays safe on prerendered
 *   (ISR/SSG) pages that call `useSearchParams`.
 */
function PaginationControl({page, totalPages, namespace = "pagination"}) {
  const t = useTranslations(namespace);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = useCallback(
    (event) => {
      const value = event.target ? event.target.value : event;
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(Number.parseInt(value, 10) || 1));
      router.push(`${pathname}?${params.toString()}`);
      if (typeof window !== "undefined") {
        window.scrollTo({top: 0, behavior: "smooth"});
      }
    },
    [router, pathname, searchParams]
  );

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={t("label")}
      className="flex items-center justify-center gap-2 pt-2"
    >
      <span className="text-sm font-medium text-muted-foreground">
        {t("pageLabel")}
      </span>
      <select
        value={page}
        onChange={handleChange}
        aria-label={t("pageLabel")}
        className="h-11 min-w-[64px] rounded-full border border-border bg-surface px-3 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {Array.from({length: totalPages}, (_, index) => index + 1).map((number) => (
          <option key={number} value={number}>
            {number}
          </option>
        ))}
      </select>
      <span className="text-sm font-medium text-muted-foreground">
        {t("ofLabel", {totalPages})}
      </span>
    </nav>
  );
}

export function Pagination(props) {
  return (
    <Suspense fallback={null}>
      <PaginationControl {...props} />
    </Suspense>
  );
}