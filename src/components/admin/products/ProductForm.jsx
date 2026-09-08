"use client";

import {useMemo} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {useForm, useFieldArray, useController} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {Loader2, Plus, Trash2} from "lucide-react";
import {productSchema} from "@/lib/validations/product";
import {SIZE_ORDER} from "@/lib/productSizes";
import {Card, CardContent} from "@/components/ui/Card";
import {Input} from "@/components/ui/Input";
import {Textarea} from "@/components/ui/Textarea";
import {Label} from "@/components/ui/Label";
import {Button} from "@/components/ui/Button";
import {Select} from "@/components/ui/Select";
import {ImageUploadField} from "@/components/admin/fields/ImageUploadField";

const PIZZA_SLUG = "pizzas";
const EXCLUDED_TOP_LEVEL_SLUGS = new Set(["pizzas", "add-ons"]);

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const emptyImage = {url: "", fileId: "", alt: {ar: "", en: ""}, isPrimary: false, sortOrder: 0};

function FieldError({message, id}) {
  return message ? (
    <p id={id} className="text-sm text-error">
      {message}
    </p>
  ) : null;
}

function SizesPricesFields({register, errors}) {
  const t = useTranslations("admin.productForm");

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold tracking-tight">
          {t("labels.sizesPrices")}
        </h4>
        <p className="text-sm text-muted-foreground">{t("sizesPricesHint")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {SIZE_ORDER.map((key) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`size-price-${key}`} className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 font-bold text-primary dark:text-primary-bright">
                {key}
              </span>
              {t(`sizeNames.${key}`)}
            </Label>
            <Input
              id={`size-price-${key}`}
              dir="ltr"
              type="number"
              min="0"
              step="1"
              placeholder={t("placeholders.sizePrice")}
              aria-invalid={errors.sizePrices?.[key] ? "true" : undefined}
              aria-describedby={
                errors.sizePrices?.[key] ? `size-price-${key}-error` : undefined
              }
              {...register(`sizePrices.${key}`)}
            />
            <FieldError
              id={`size-price-${key}-error`}
              message={errors.sizePrices?.[key]?.message}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function IngredientsFields({control, register, errors}) {
  const t = useTranslations("admin.productForm");
  const {fields, append, remove} = useFieldArray({control, name: "ingredients"});

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold tracking-tight">
          {t("labels.ingredients")}
        </h4>
        <p className="text-sm text-muted-foreground">{t("ingredientsHint")}</p>
      </div>

      {fields.map((ingredient, ingredientIndex) => (
        <div
          key={ingredient.id}
          className="space-y-3 rounded-xl border border-border bg-background p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("labels.ingredientNameEn")} #{ingredientIndex + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(ingredientIndex)}
              aria-label={t("removeIngredient")}
              title={t("removeIngredient")}
              className="h-8 w-8 px-0 text-muted-foreground hover:text-error"
            >
              <Trash2 className="h-4 w-4 rtl:-scale-x-100" />
            </Button>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`ingredient-name-ar-${ingredientIndex}`}>
                {t("labels.ingredientNameAr")}
              </Label>
              <Input
                id={`ingredient-name-ar-${ingredientIndex}`}
                dir="rtl"
                placeholder={t("placeholders.ingredientNameAr")}
                aria-invalid={
                  errors.ingredients?.[ingredientIndex]?.ar ? "true" : undefined
                }
                aria-describedby={
                  errors.ingredients?.[ingredientIndex]?.ar
                    ? `ingredient-name-ar-${ingredientIndex}-error`
                    : undefined
                }
                {...register(`ingredients.${ingredientIndex}.ar`)}
              />
              <FieldError
                id={`ingredient-name-ar-${ingredientIndex}-error`}
                message={errors.ingredients?.[ingredientIndex]?.ar?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`ingredient-name-en-${ingredientIndex}`}>
                {t("labels.ingredientNameEn")}
              </Label>
              <Input
                id={`ingredient-name-en-${ingredientIndex}`}
                dir="ltr"
                placeholder={t("placeholders.ingredientNameEn")}
                aria-invalid={
                  errors.ingredients?.[ingredientIndex]?.en ? "true" : undefined
                }
                aria-describedby={
                  errors.ingredients?.[ingredientIndex]?.en
                    ? `ingredient-name-en-${ingredientIndex}-error`
                    : undefined
                }
                {...register(`ingredients.${ingredientIndex}.en`)}
              />
              <FieldError
                id={`ingredient-name-en-${ingredientIndex}-error`}
                message={errors.ingredients?.[ingredientIndex]?.en?.message}
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ar: "", en: ""})
        }
      >
        <Plus className="h-4 w-4" />
        {t("addIngredient")}
      </Button>
    </div>
  );
}

function PrimaryImageCheckbox({control, name, onMakePrimary}) {
  const t = useTranslations("admin.productForm");
  const {field} = useController({control, name});

  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={field.value === true}
        onChange={(event) => {
          if (event.target.checked) {
            onMakePrimary();
          } else {
            field.onChange(false);
          }
        }}
        className="h-4 w-4 accent-primary"
      />
      <span className="text-sm font-medium leading-none">
        {t("labels.isPrimary")}
      </span>
    </label>
  );
}

function sizePriceDefaults(product) {
  const optionByKey = {};
  for (const option of product.measuringUnit?.options ?? []) {
    optionByKey[option.key] = option;
  }

  const sizePrices = {};
  for (const key of SIZE_ORDER) {
    sizePrices[key] =
      typeof optionByKey[key]?.price === "number"
        ? String(optionByKey[key].price)
        : "";
  }

  return sizePrices;
}

export function ProductForm({mode, product, categories, locale}) {
  const t = useTranslations("admin.productForm");
  const router = useRouter();

  const defaultValues = useMemo(() => {
    if (mode === "edit" && product) {
      return {
        name: {ar: product.name?.ar ?? "", en: product.name?.en ?? ""},
        slug: product.slug ?? "",
        description: {
          ar: product.description?.ar ?? "",
          en: product.description?.en ?? "",
        },
        category: product.category ?? "",
        price:
          product.hasMeasuringUnit === true
            ? ""
            : typeof product.price === "number"
              ? String(product.price)
              : "",
        sizePrices: sizePriceDefaults(product),
        isActive: product.isActive ?? true,
        isAvailable: product.isAvailable ?? true,
        isFeatured: product.isFeatured ?? false,
        isNewItem: product.isNewItem ?? false,
        sortOrder: product.sortOrder ?? 0,
        ingredients: (Array.isArray(product.ingredients)
          ? product.ingredients
          : []
        ).map((ingredient) => ({
          ar: ingredient.ar ?? "",
          en: ingredient.en ?? "",
        })),
        images: (Array.isArray(product.images) ? product.images : []).map(
          (image) => ({
            url: image.url ?? "",
            fileId: image.fileId ?? "",
            alt: image.alt ?? {ar: "", en: ""},
            isPrimary: image.isPrimary === true,
            sortOrder: image.sortOrder ?? 0,
          })
        ),
      };
    }
    return {
      name: {ar: "", en: ""},
      slug: "",
      description: {ar: "", en: ""},
      category: "",
      price: "",
      sizePrices: {S: "", M: "", L: ""},
      isActive: true,
      isAvailable: true,
      isFeatured: false,
      isNewItem: false,
      sortOrder: 0,
      ingredients: [],
      images: [{...emptyImage, isPrimary: true}],
    };
  }, [mode, product]);

  const schema = useMemo(
    () =>
      productSchema({
        required: t("validation.required"),
        invalidSlug: t("validation.invalidSlug"),
        invalidCategory: t("validation.invalidCategory"),
        minZero: t("validation.minZero"),
        sizeOrBaseRequired: t("validation.sizeOrBaseRequired"),
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

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({control, name: "images"});

  const pizzasCategory = categories.find((item) => item.slug === PIZZA_SLUG);

  const pizzaSubcategories = categories
    .filter(
      (item) => pizzasCategory && item.parent === pizzasCategory.id
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const otherCategories = categories
    .filter((item) => !item.parent && !EXCLUDED_TOP_LEVEL_SLUGS.has(item.slug))
    .sort((a, b) => a.sortOrder - b.sortOrder);

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
    data.images = data.images.map((image) =>
      image.url
        ? {...image, alt: {ar: data.name.ar || "", en: data.name.en || ""}}
        : image
    );

    data.ingredients = (data.ingredients || []).filter(
      (ingredient) => ingredient.ar.trim() || ingredient.en.trim()
    );

    const endpoint =
      mode === "edit"
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";

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
        } else {
          toast.error(t("errorGeneric"));
        }
        return;
      }

      toast.success(mode === "edit" ? t("successUpdate") : t("successCreate"));
      router.push(`/${locale}/admin/products`);
      router.refresh();
    } catch {
      toast.error(t("errorGeneric"));
    }
  });

  const sectionTitle = "text-sm font-semibold uppercase tracking-wide text-muted-foreground";

  return (
    <Card className="max-w-4xl shadow-soft">
      <CardContent className="p-6">
        <form onSubmit={onSubmit} noValidate className="space-y-8">
          <div className="space-y-4">
            <h3 className={sectionTitle}>{t("sectionBasic")}</h3>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-name-ar">{t("labels.nameAr")}</Label>
                <Input
                  id="product-name-ar"
                  dir="rtl"
                  placeholder={t("placeholders.nameAr")}
                  aria-invalid={errors.name?.ar ? "true" : undefined}
                  aria-describedby={
                    errors.name?.ar ? "product-name-ar-error" : undefined
                  }
                  {...register("name.ar")}
                />
                <FieldError
                  id="product-name-ar-error"
                  message={errors.name?.ar?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-name-en">{t("labels.nameEn")}</Label>
                <Input
                  id="product-name-en"
                  dir="ltr"
                  placeholder={t("placeholders.nameEn")}
                  aria-invalid={errors.name?.en ? "true" : undefined}
                  aria-describedby={
                    errors.name?.en ? "product-name-en-error" : undefined
                  }
                  {...register("name.en")}
                  onBlur={(event) => {
                    register("name.en").onBlur(event);
                    generateSlug();
                  }}
                />
                <FieldError
                  id="product-name-en-error"
                  message={errors.name?.en?.message}
                />
              </div>
            </div>

            <input type="hidden" {...register("slug")} />

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-desc-ar">{t("labels.descriptionAr")}</Label>
                <Textarea
                  id="product-desc-ar"
                  dir="rtl"
                  placeholder={t("placeholders.descriptionAr")}
                  aria-invalid={errors.description?.ar ? "true" : undefined}
                  aria-describedby={
                    errors.description?.ar ? "product-desc-ar-error" : undefined
                  }
                  {...register("description.ar")}
                />
                <FieldError
                  id="product-desc-ar-error"
                  message={errors.description?.ar?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-desc-en">{t("labels.descriptionEn")}</Label>
                <Textarea
                  id="product-desc-en"
                  dir="ltr"
                  placeholder={t("placeholders.descriptionEn")}
                  aria-invalid={errors.description?.en ? "true" : undefined}
                  aria-describedby={
                    errors.description?.en ? "product-desc-en-error" : undefined
                  }
                  {...register("description.en")}
                />
                <FieldError
                  id="product-desc-en-error"
                  message={errors.description?.en?.message}
                />
              </div>
            </div>

            <IngredientsFields
              control={control}
              register={register}
              errors={errors}
            />

            <div className="space-y-2">
              <Label htmlFor="product-category">{t("labels.category")}</Label>
              <Select
                id="product-category"
                {...register("category")}
                aria-invalid={errors.category ? "true" : undefined}
                aria-describedby={
                  errors.category ? "product-category-error" : undefined
                }
              >
                <option value="">{t("placeholders.categorySelect")}</option>
                {pizzaSubcategories.length > 0 ? (
                  <optgroup label={t("optgroupPizzaTypes")}>
                    {pizzaSubcategories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name.en}
                        {item.name.ar ? ` — ${item.name.ar}` : ""}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                {otherCategories.length > 0 ? (
                  <optgroup label={t("optgroupOtherCategories")}>
                    {otherCategories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name.en}
                        {item.name.ar ? ` — ${item.name.ar}` : ""}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
              </Select>
              <FieldError
                id="product-category-error"
                message={errors.category?.message}
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-8">
            <h3 className={sectionTitle}>{t("sectionPricing")}</h3>

            <SizesPricesFields register={register} errors={errors} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-price">{t("labels.basePrice")}</Label>
                <Input
                  id="product-price"
                  dir="ltr"
                  type="number"
                  min="0"
                  step="0.5"
                  aria-invalid={errors.price ? "true" : undefined}
                  aria-describedby={errors.price ? "product-price-error" : undefined}
                  {...register("price")}
                />
                <FieldError id="product-price-error" message={errors.price?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-sort-order">{t("labels.sortOrder")}</Label>
                <Input
                  id="product-sort-order"
                  dir="ltr"
                  type="number"
                  min="0"
                  step="1"
                  aria-invalid={errors.sortOrder ? "true" : undefined}
                  aria-describedby={
                    errors.sortOrder ? "product-sort-order-error" : undefined
                  }
                  {...register("sortOrder")}
                />
                <FieldError
                  id="product-sort-order-error"
                  message={errors.sortOrder?.message}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  {...register("isActive")}
                />
                <span className="text-sm font-medium leading-none">
                  {t("labels.isActive")}
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  {...register("isAvailable")}
                />
                <span className="text-sm font-medium leading-none">
                  {t("labels.isAvailable")}
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  {...register("isFeatured")}
                />
                <span className="text-sm font-medium leading-none">
                  {t("labels.isFeatured")}
                </span>
              </label>
              <div className="space-y-1">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    {...register("isNewItem")}
                  />
                  <span className="text-sm font-medium leading-none">
                    {t("labels.isNew")}
                  </span>
                </label>
                <p className="ml-7 text-xs text-muted-foreground">
                  {t("isNewHint")}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-8">
            <h3 className={sectionTitle}>{t("sectionImages")}</h3>

            <div className="space-y-4">
              {imageFields.map((image, imageIndex) => (
                <div
                  key={image.id}
                  className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold tracking-tight">
                      {t("sectionImages")} #{imageIndex + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(imageIndex)}
                      className="h-8 w-8 px-0 text-muted-foreground hover:text-error"
                      aria-label={t("removeImage")}
                      title={t("removeImage")}
                    >
                      <Trash2 className="h-4 w-4 rtl:-scale-x-100" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <ImageUploadField
                      control={control}
                      name={`images.${imageIndex}`}
                      altFallback={t("imageAltFallback")}
                      disabled={isSubmitting || isSubmitSuccessful}
                      ariaDescribedBy={
                        errors.images?.[imageIndex]?.url
                          ? `image-${imageIndex}-error`
                          : undefined
                      }
                    />
                    <FieldError
                      id={`image-${imageIndex}-error`}
                      message={errors.images?.[imageIndex]?.url?.message}
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <PrimaryImageCheckbox
                      control={control}
                      name={`images.${imageIndex}.isPrimary`}
                      onMakePrimary={() => {
                        imageFields.forEach((_, otherIndex) => {
                          setValue(`images.${otherIndex}.isPrimary`, otherIndex === imageIndex);
                        });
                      }}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendImage({...emptyImage, sortOrder: imageFields.length})
                }
              >
                <Plus className="h-4 w-4" />
                {t("addImage")}
              </Button>
            </div>
          </div>

          <div className="sticky bottom-0 -mx-6 -mb-6 rounded-b-2xl border-t border-border bg-surface/95 p-6 pt-4 shadow-clay-md backdrop-blur-md sm:static sm:mx-0 sm:mb-0 sm:rounded-none sm:border-t-0 sm:bg-transparent sm:p-0 sm:pt-8 sm:shadow-none">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href={`/${locale}/admin/products`}
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