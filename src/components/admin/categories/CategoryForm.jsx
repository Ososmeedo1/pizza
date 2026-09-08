"use client";

import {useMemo} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {Loader2} from "lucide-react";
import {categorySchema} from "@/lib/validations/category";
import {Card, CardContent} from "@/components/ui/Card";
import {Input} from "@/components/ui/Input";
import {Textarea} from "@/components/ui/Textarea";
import {Label} from "@/components/ui/Label";
import {Button} from "@/components/ui/Button";
import {Select} from "@/components/ui/Select";
import {ImageUploadField} from "@/components/admin/fields/ImageUploadField";

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const emptyValues = {
  name: {ar: "", en: ""},
  slug: "",
  description: {ar: "", en: ""},
  image: {url: "", fileId: "", alt: {ar: "", en: ""}},
  parent: "",
  isActive: true,
  sortOrder: 0,
};

export function CategoryForm({mode, category, parentCategories, locale}) {
  const t = useTranslations("admin.categoryForm");
  const router = useRouter();

  const defaultValues = useMemo(() => {
    if (mode === "edit" && category) {
      return {
        name: {ar: category.name?.ar ?? "", en: category.name?.en ?? ""},
        slug: category.slug ?? "",
        description: {
          ar: category.description?.ar ?? "",
          en: category.description?.en ?? "",
        },
        image: {
          url: category.image?.url ?? "",
          fileId: category.image?.fileId ?? "",
          alt: {
            ar: category.image?.alt?.ar ?? "",
            en: category.image?.alt?.en ?? "",
          },
        },
        parent: category.parent ?? "",
        isActive: category.isActive ?? true,
        sortOrder: category.sortOrder ?? 0,
      };
    }
    return emptyValues;
  }, [mode, category]);

  const schema = useMemo(
    () =>
      categorySchema({
        required: t("validation.required"),
        invalidSlug: t("validation.invalidSlug"),
        invalidUrl: t("validation.invalidUrl"),
        minZero: t("validation.minZero"),
        invalidParent: t("validation.invalidParent"),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: {errors, isSubmitting, isSubmitSuccessful},
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const generateSlug = () => {
    if (getValues("slug")) {
      return;
    }
    const slug = slugify(getValues("name.en"));
    if (slug) {
      setValue("slug", slug, {shouldValidate: true});
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (data.image?.url) {
      data.image.alt = {ar: data.name.ar || "", en: data.name.en || ""};
    }

    const endpoint =
      mode === "edit"
        ? `/api/admin/categories/${category.id}`
        : "/api/admin/categories";

    try {
      const response = await fetch(endpoint, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        if (body?.error === "SLUG_EXISTS") {
          toast.error(t("errorSlugExists"));
        } else if (body?.error === "UNAUTHORIZED") {
          router.replace(`/${locale}/admin/login`);
        } else if (body?.error === "NOT_FOUND") {
          toast.error(t("errorNotFound"));
        } else if (
          body?.error === "PARENT_NOT_FOUND" ||
          body?.error === "PARENT_INVALID"
        ) {
          toast.error(t("errorParentNotFound"));
        } else if (
          body?.error === "PARENT_SELF" ||
          body?.error === "PARENT_CYCLE"
        ) {
          toast.error(t("errorParentCycle"));
        } else {
          toast.error(t("errorGeneric"));
        }
        return;
      }

      toast.success(mode === "edit" ? t("successUpdate") : t("successCreate"));
      router.push(`/${locale}/admin/categories`);
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
                <Label htmlFor="name.ar">{t("labels.nameAr")}</Label>
                <Input
                  id="name.ar"
                  dir="rtl"
                  placeholder={t("placeholders.nameAr")}
                  aria-invalid={errors.name?.ar ? "true" : undefined}
                  aria-describedby={
                    errors.name?.ar ? "name.ar-error" : undefined
                  }
                  {...register("name.ar")}
                />
                {errors.name?.ar ? (
                  <p id="name.ar-error" className="text-sm text-error">
                    {errors.name.ar.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name.en">{t("labels.nameEn")}</Label>
                <Input
                  id="name.en"
                  dir="ltr"
                  placeholder={t("placeholders.nameEn")}
                  aria-invalid={errors.name?.en ? "true" : undefined}
                  aria-describedby={
                    errors.name?.en ? "name.en-error" : undefined
                  }
                  {...register("name.en")}
                  onBlur={(event) => {
                    register("name.en").onBlur(event);
                    generateSlug();
                  }}
                />
                {errors.name?.en ? (
                  <p id="name.en-error" className="text-sm text-error">
                    {errors.name.en.message}
                  </p>
                ) : null}
              </div>
            </div>

            <input type="hidden" {...register("slug")} />

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="description.ar">{t("labels.descriptionAr")}</Label>
                <Textarea
                  id="description.ar"
                  dir="rtl"
                  placeholder={t("placeholders.descriptionAr")}
                  aria-invalid={errors.description?.ar ? "true" : undefined}
                  aria-describedby={
                    errors.description?.ar ? "description.ar-error" : undefined
                  }
                  {...register("description.ar")}
                />
                {errors.description?.ar ? (
                  <p id="description.ar-error" className="text-sm text-error">
                    {errors.description.ar.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description.en">{t("labels.descriptionEn")}</Label>
                <Textarea
                  id="description.en"
                  dir="ltr"
                  placeholder={t("placeholders.descriptionEn")}
                  aria-invalid={errors.description?.en ? "true" : undefined}
                  aria-describedby={
                    errors.description?.en ? "description.en-error" : undefined
                  }
                  {...register("description.en")}
                />
                {errors.description?.en ? (
                  <p id="description.en-error" className="text-sm text-error">
                    {errors.description.en.message}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-8">
            <h3 className={sectionTitle}>{t("sectionImage")}</h3>

            <div className="space-y-2">
              <ImageUploadField
                control={control}
                name="image"
                altFallback={t("imageAltFallback")}
                disabled={isSubmitting || isSubmitSuccessful}
                ariaDescribedBy={errors.image?.url ? "image-error" : undefined}
              />
              {errors.image?.url ? (
                <p id="image-error" className="text-sm text-error">
                  {errors.image.url.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-8">
            <h3 className={sectionTitle}>{t("sectionSettings")}</h3>

            <div className="flex items-center gap-3">
              <input
                id="isActive"
                type="checkbox"
                className="h-4 w-4 accent-primary"
                {...register("isActive")}
              />
              <Label htmlFor="isActive">{t("labels.isActive")}</Label>
            </div>

            <div className="max-w-md space-y-2">
              <Label htmlFor="parent">{t("labels.parent")}</Label>
              <Select
                id="parent"
                {...register("parent")}
                aria-invalid={errors.parent ? "true" : undefined}
                aria-describedby={errors.parent ? "parent-error" : undefined}
              >
                <option value="">{t("placeholders.parentNone")}</option>
                {(parentCategories ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name.en}
                    {item.name.ar ? ` — ${item.name.ar}` : ""}
                  </option>
                ))}
              </Select>
              {errors.parent ? (
                <p id="parent-error" className="text-sm text-error">
                  {errors.parent.message}
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground">{t("parentHint")}</p>
            </div>

            <div className="max-w-xs space-y-2">
              <Label htmlFor="sortOrder">{t("labels.sortOrder")}</Label>
              <Input
                id="sortOrder"
                dir="ltr"
                type="number"
                min="0"
                step="1"
                aria-invalid={errors.sortOrder ? "true" : undefined}
                aria-describedby={errors.sortOrder ? "sortOrder-error" : undefined}
                {...register("sortOrder")}
              />
              {errors.sortOrder ? (
                <p id="sortOrder-error" className="text-sm text-error">
                  {errors.sortOrder.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="sticky bottom-0 -mx-6 -mb-6 rounded-b-2xl border-t border-border bg-surface/95 p-6 pt-4 shadow-clay-md backdrop-blur-md sm:static sm:mx-0 sm:mb-0 sm:rounded-none sm:border-t-0 sm:bg-transparent sm:p-0 sm:pt-8 sm:shadow-none">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href={`/${locale}/admin/categories`}
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