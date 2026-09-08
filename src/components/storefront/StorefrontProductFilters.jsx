"use client";

import {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {FilterX, Search} from "lucide-react";
import {Input} from "@/components/ui/Input";
import {Select} from "@/components/ui/Select";
import {Button} from "@/components/ui/Button";

export function StorefrontProductFilters({categories = [], initialSearch = "", initialCategory = ""}) {
  const t = useTranslations("storefront.filters");
  const locale = useLocale();
  const router = useRouter();

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);

  const hasFilters = Boolean(initialSearch || initialCategory);

  const basePath = `/${locale}/products`;

  const apply = useCallback(
    (nextSearch, nextCategory) => {
      const params = new URLSearchParams();
      if (nextSearch) params.set("search", nextSearch);
      if (nextCategory) params.set("category", nextCategory);
      const qs = params.toString();
      router.replace(`${basePath}${qs ? `?${qs}` : ""}`);
    },
    [router, basePath]
  );

  useEffect(() => {
    if (search.trim() === initialSearch) {
      return;
    }
    const timer = setTimeout(() => {
      apply(search.trim(), category);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, category, initialSearch, apply]);

  const handleCategory = (value) => {
    setCategory(value);
    apply(search.trim(), value);
  };

  const handleClear = () => {
    setSearch("");
    setCategory("");
    router.replace(basePath);
  };

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border/20 bg-surface p-3 shadow-clay-sm sm:flex-row sm:items-center sm:gap-3 sm:p-4">
      <div className="relative min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground"
        />
        <Input
          type="search"
          dir="auto"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="ps-9"
          aria-label={t("searchPlaceholder")}
        />
      </div>

      <div className="w-full sm:w-56">
        <Select
          value={category}
          onChange={(event) => handleCategory(event.target.value)}
          aria-label={t("allCategories")}
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </Select>
      </div>

      {hasFilters ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleClear}
          className="w-full px-4 sm:w-auto"
        >
          <FilterX className="h-4 w-4" />
          {t("clearFilters")}
        </Button>
      ) : null}
    </div>
  );
}
