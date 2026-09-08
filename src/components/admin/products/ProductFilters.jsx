"use client";

import {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {Search, X} from "lucide-react";
import {Input} from "@/components/ui/Input";
import {Select} from "@/components/ui/Select";
import {Button} from "@/components/ui/Button";

export function ProductFilters({
  locale,
  categories,
  defaultSearch = "",
  defaultCategory = "",
}) {
  const t = useTranslations("admin.products");
  const router = useRouter();
  const [search, setSearch] = useState(defaultSearch);
  const [category, setCategory] = useState(defaultCategory);

  const hasFilters = Boolean(defaultSearch || defaultCategory);

  const apply = useCallback(
    (nextSearch, nextCategory) => {
      const params = new URLSearchParams();
      if (nextSearch) params.set("search", nextSearch);
      if (nextCategory) params.set("category", nextCategory);
      const qs = params.toString();
      router.replace(`/${locale}/admin/products${qs ? `?${qs}` : ""}`);
    },
    [locale, router]
  );

  useEffect(() => {
    if (search.trim() === defaultSearch) {
      return;
    }
    const timer = setTimeout(() => {
      apply(search.trim(), category);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, category, apply, defaultSearch]);

  const handleCategory = (value) => {
    setCategory(value);
    apply(search.trim(), value);
  };

  const handleClear = () => {
    setSearch("");
    setCategory("");
    apply("", "");
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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

      <div className="sm:w-56">
        <Select
          value={category}
          onChange={(event) => handleCategory(event.target.value)}
          aria-label={t("filterCategory")}
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name.en}
              {item.name.ar ? ` — ${item.name.ar}` : ""}
            </option>
          ))}
        </Select>
      </div>

      {hasFilters ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="h-10"
        >
          <X className="h-4 w-4" />
          {t("clearFilters")}
        </Button>
      ) : null}
    </div>
  );
}