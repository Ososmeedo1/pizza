"use client";

import {useMemo} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {Loader2} from "lucide-react";
import {addOnSchema} from "@/lib/validations/addon";
import {Card, CardContent} from "@/components/ui/Card";
import {Input} from "@/components/ui/Input";
import {Label} from "@/components/ui/Label";
import {Button} from "@/components/ui/Button";

function FieldError({message, id}) {
  return message ? (
    <p id={id} className="text-sm text-error">
      {message}
    </p>
  ) : null;
}

const emptyValues = {
  name: {ar: "", en: ""},
  priceMode: "flat",
  price: "",
  sizePrices: {S: "", M: "", L: ""},
  isActive: true,
  sortOrder: 0,
};

export function AddOnForm({mode, addon, locale}) {
  const t = useTranslations("admin.addOnForm");
  const router = useRouter();

  const defaultValues = useMemo(() => {
    if (mode === "edit" && addon) {
      return {
        name: {ar: addon.name?.ar ?? "", en: addon.name?.en ?? ""},
        priceMode: addon.priceMode ?? "flat",
        price: typeof addon.price === "number" ? String(addon.price) : "",
        sizePrices: {
          S:
            typeof addon.sizePrices?.S === "number"
              ? String(addon.sizePrices.S)
              : "",
          M:
            typeof addon.sizePrices?.M === "number"
              ? String(addon.sizePrices.M)
              : "",
          L:
            typeof addon.sizePrices?.L === "number"
              ? String(addon.sizePrices.L)
              : "",
        },
        isActive: addon.isActive ?? true,
        sortOrder: addon.sortOrder ?? 0,
      };
    }
    return emptyValues;
  }, [mode, addon]);

  const schema = useMemo(
    () =>
      addOnSchema({
        required: t("validation.required"),
        invalidPriceMode: t("validation.invalidPriceMode"),
        minZero: t("validation.minZero"),
        flatPriceRequired: t("validation.flatPriceRequired"),
        atLeastOneSize: t("validation.atLeastOneSize"),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: {errors, isSubmitting, isSubmitSuccessful},
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // React Hook Form's `watch()` returns a non-memoizable subscription to the
  // form store, which the React Compiler flags as an incompatible library.
  // Scoped disable: the read is required for the price-mode field switch.
  // eslint-disable-next-line react-hooks/incompatible-library
  const priceMode = watch("priceMode");

  const onSubmit = handleSubmit(async (data) => {
    const endpoint =
      mode === "edit" ? `/api/admin/addons/${addon.id}` : "/api/admin/addons";

    try {
      const response = await fetch(endpoint, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        if (body?.error === "UNAUTHORIZED") {
          router.replace(`/${locale}/admin/login`);
        } else if (body?.error === "NOT_FOUND") {
          toast.error(t("errorNotFound"));
        } else {
          toast.error(t("errorGeneric"));
        }
        return;
      }

      toast.success(mode === "edit" ? t("successUpdate") : t("successCreate"));
      router.push(`/${locale}/admin/addons`);
      router.refresh();
    } catch {
      toast.error(t("errorGeneric"));
    }
  });

  const sectionTitle = "text-sm font-semibold uppercase tracking-wide text-muted-foreground";

  return (
    <Card className="max-w-3xl shadow-soft">
      <CardContent className="p-6">
        <form onSubmit={onSubmit} noValidate className="space-y-8">
          <div className="space-y-4">
            <h3 className={sectionTitle}>{t("sectionBasic")}</h3>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="addon-name-ar">{t("labels.nameAr")}</Label>
                <Input
                  id="addon-name-ar"
                  dir="rtl"
                  placeholder={t("placeholders.nameAr")}
                  aria-invalid={errors.name?.ar ? "true" : undefined}
                  aria-describedby={
                    errors.name?.ar ? "addon-name-ar-error" : undefined
                  }
                  {...register("name.ar")}
                />
                <FieldError id="addon-name-ar-error" message={errors.name?.ar?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addon-name-en">{t("labels.nameEn")}</Label>
                <Input
                  id="addon-name-en"
                  dir="ltr"
                  placeholder={t("placeholders.nameEn")}
                  aria-invalid={errors.name?.en ? "true" : undefined}
                  aria-describedby={
                    errors.name?.en ? "addon-name-en-error" : undefined
                  }
                  {...register("name.en")}
                />
                <FieldError id="addon-name-en-error" message={errors.name?.en?.message} />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-8">
            <h3 className={sectionTitle}>{t("sectionPricing")}</h3>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium leading-none">
                {t("labels.priceMode")}
              </legend>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    value="flat"
                    className="h-4 w-4 accent-primary"
                    {...register("priceMode")}
                  />
                  {t("labels.priceModeFlat")}
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    value="bySize"
                    className="h-4 w-4 accent-primary"
                    {...register("priceMode")}
                  />
                  {t("labels.priceModeBySize")}
                </label>
              </div>
              <p className="text-xs text-muted-foreground">{t("priceModeHint")}</p>
            </fieldset>

            {priceMode === "flat" ? (
              <div className="max-w-xs space-y-2">
                <Label htmlFor="addon-price">{t("labels.price")}</Label>
                <Input
                  id="addon-price"
                  dir="ltr"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder={t("placeholders.price")}
                  aria-invalid={errors.price ? "true" : undefined}
                  aria-describedby={errors.price ? "addon-price-error" : undefined}
                  {...register("price")}
                />
                <FieldError id="addon-price-error" message={errors.price?.message} />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-4">
                  {(["S", "M", "L"]).map((size) => {
                    const field = `sizePrices.${size}`;
                    return (
                      <div key={size} className="w-32 space-y-2">
                        <Label htmlFor={`addon-size-${size.toLowerCase()}`}>
                          {t("labels.price")} {size}
                        </Label>
                        <Input
                          id={`addon-size-${size.toLowerCase()}`}
                          dir="ltr"
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder={t("placeholders.price")}
                          aria-invalid={
                            errors.sizePrices?.[size] ? "true" : undefined
                          }
                          aria-describedby={
                            errors.sizePrices?.[size]
                              ? `addon-size-${size.toLowerCase()}-error`
                              : undefined
                          }
                          {...register(`sizePrices.${size}`)}
                        />
                        <FieldError
                          id={`addon-size-${size.toLowerCase()}-error`}
                          message={errors.sizePrices?.[size]?.message}
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">{t("bySizeHint")}</p>
                <FieldError id="sizePrices-error" message={errors.sizePrices?.message} />
              </div>
            )}
          </div>

          <div className="space-y-4 border-t border-border pt-8">
            <h3 className={sectionTitle}>{t("sectionSettings")}</h3>

            <div className="flex items-center gap-3">
              <input
                id="addon-is-active"
                type="checkbox"
                className="h-4 w-4 accent-primary"
                {...register("isActive")}
              />
              <Label htmlFor="addon-is-active">{t("labels.isActive")}</Label>
            </div>

            <div className="max-w-xs space-y-2">
              <Label htmlFor="addon-sort-order">{t("labels.sortOrder")}</Label>
              <Input
                id="addon-sort-order"
                dir="ltr"
                type="number"
                min="0"
                step="1"
                aria-invalid={errors.sortOrder ? "true" : undefined}
                aria-describedby={
                  errors.sortOrder ? "addon-sort-order-error" : undefined
                }
                {...register("sortOrder")}
              />
              <FieldError
                id="addon-sort-order-error"
                message={errors.sortOrder?.message}
              />
            </div>
          </div>

          <div className="sticky bottom-0 -mx-6 -mb-6 rounded-b-2xl border-t border-border bg-surface/95 p-6 pt-4 shadow-clay-md backdrop-blur-md sm:static sm:mx-0 sm:mb-0 sm:rounded-none sm:border-t-0 sm:bg-transparent sm:p-0 sm:pt-8 sm:shadow-none">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href={`/${locale}/admin/addons`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-extrabold uppercase tracking-wide transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-10"
              >
                {t("cancel")}
              </Link>
              <Button type="submit" disabled={isSubmitting} className="h-12 sm:h-10">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {mode === "edit" ? t("submitUpdate") : t("submitCreate")}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}