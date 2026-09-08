"use client";

import {useMemo} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {Loader2, Plus, Trash2} from "lucide-react";
import {settingsSchema} from "@/lib/validations/settings";
import {Card, CardContent} from "@/components/ui/Card";
import {Input} from "@/components/ui/Input";
import {Textarea} from "@/components/ui/Textarea";
import {Label} from "@/components/ui/Label";
import {Button} from "@/components/ui/Button";
import {ImageUploadField} from "@/components/admin/fields/ImageUploadField";

const emptyValues = {
  brandName: {ar: "", en: ""},
  logo: {url: "", fileId: "", alt: {ar: "", en: ""}},
  favicon: {url: "", fileId: "", alt: {ar: "", en: ""}},
  phone: "",
  email: "",
  instagram: "",
  facebook: "",
  openingHours: {ar: "", en: ""},
  contactMessage: {ar: "", en: ""},
};

const emptyBranch = {
  name: {ar: "", en: ""},
  address: {ar: "", en: ""},
  phone: "",
  mapUrl: "",
};

export function SettingsForm({settings, locale}) {
  const t = useTranslations("admin.settingsForm");
  const router = useRouter();

  const defaultValues = useMemo(() => {
    return {
      brandName: {
        ar: settings.brandName?.ar ?? "",
        en: settings.brandName?.en ?? "",
      },
      logo: {
        url: settings.logo?.url ?? "",
        fileId: settings.logo?.fileId ?? "",
        alt: {
          ar: settings.logo?.alt?.ar ?? "",
          en: settings.logo?.alt?.en ?? "",
        },
      },
      favicon: {
        url: settings.favicon?.url ?? "",
        fileId: settings.favicon?.fileId ?? "",
        alt: {
          ar: settings.favicon?.alt?.ar ?? "",
          en: settings.favicon?.alt?.en ?? "",
        },
      },
      phone: settings.phone ?? "",
      email: settings.email ?? "",
      branches: Array.isArray(settings.branches)
        ? settings.branches.map((branch) => ({
            name: {
              ar: branch.name?.ar ?? "",
              en: branch.name?.en ?? "",
            },
            address: {
              ar: branch.address?.ar ?? "",
              en: branch.address?.en ?? "",
            },
            phone: branch.phone ?? "",
            mapUrl: branch.mapUrl ?? "",
          }))
        : [],
      instagram: settings.instagram ?? "",
      facebook: settings.facebook ?? "",
      openingHours: {
        ar: settings.openingHours?.ar ?? "",
        en: settings.openingHours?.en ?? "",
      },
      contactMessage: {
        ar: settings.contactMessage?.ar ?? "",
        en: settings.contactMessage?.en ?? "",
      },
    };
  }, [settings]);

  const schema = useMemo(
    () =>
      settingsSchema({
        required: t("validation.required"),
        invalidUrl: t("validation.invalidUrl"),
        invalidCoordinate: t("validation.invalidCoordinate"),
        invalidPhone: t("validation.invalidPhone"),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    control,
    getValues,
    reset,
    formState: {errors, isSubmitting, isSubmitSuccessful},
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    fields: branchFields,
    append: appendBranch,
    remove: removeBranch,
  } = useFieldArray({
    control,
    name: "branches",
  });

  const onSubmit = handleSubmit(async (data) => {
    if (data.logo?.url) {
      data.logo.alt = {ar: data.brandName.ar || "", en: data.brandName.en || ""};
    }
    if (data.favicon?.url) {
      data.favicon.alt = {ar: data.brandName.ar || "", en: data.brandName.en || ""};
    }

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        if (body?.error === "UNAUTHORIZED") {
          router.replace(`/${locale}/admin/login`);
        } else {
          toast.error(t("errorGeneric"));
        }
        return;
      }

      toast.success(t("successUpdate"));
      reset(getValues(), {keepDefaultValues: true});
      router.refresh();
    } catch {
      toast.error(t("errorGeneric"));
    }
  });

  const sectionTitle =
    "text-sm font-semibold uppercase tracking-wide text-muted-foreground";

  const disabled = isSubmitting || isSubmitSuccessful;

  return (
    <Card className="max-w-3xl shadow-soft">
      <CardContent className="p-6">
        <form onSubmit={onSubmit} noValidate className="space-y-8">
          {/* Brand Identity */}
          <div className="space-y-4">
            <h3 className={sectionTitle}>{t("sectionBrand")}</h3>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brandName.ar">{t("labels.brandNameAr")}</Label>
                <Input
                  id="brandName.ar"
                  dir="rtl"
                  placeholder={t("placeholders.brandNameAr")}
                  aria-invalid={errors.brandName?.ar ? "true" : undefined}
                  aria-describedby={
                    errors.brandName?.ar ? "brandName.ar-error" : undefined
                  }
                  {...register("brandName.ar")}
                />
                {errors.brandName?.ar ? (
                  <p id="brandName.ar-error" className="text-sm text-error">
                    {errors.brandName.ar.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandName.en">{t("labels.brandNameEn")}</Label>
                <Input
                  id="brandName.en"
                  dir="ltr"
                  placeholder={t("placeholders.brandNameEn")}
                  aria-invalid={errors.brandName?.en ? "true" : undefined}
                  aria-describedby={
                    errors.brandName?.en ? "brandName.en-error" : undefined
                  }
                  {...register("brandName.en")}
                />
                {errors.brandName?.en ? (
                  <p id="brandName.en-error" className="text-sm text-error">
                    {errors.brandName.en.message}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <ImageUploadField
                control={control}
                name="logo"
                altFallback={t("logoAltFallback")}
                disabled={disabled}
                className="max-w-md"
                ariaDescribedBy={errors.logo?.url ? "logo-url-error" : undefined}
              />
              {errors.logo?.url ? (
                <p id="logo-url-error" className="text-sm text-error">
                  {errors.logo.url.message}
                </p>
              ) : null}
            </div>

            {/* Favicon */}
            <div className="space-y-2">
              <ImageUploadField
                control={control}
                name="favicon"
                altFallback={t("faviconAltFallback")}
                disabled={disabled}
                className="max-w-40"
                ariaDescribedBy={errors.favicon?.url ? "favicon-url-error" : undefined}
              />
              {errors.favicon?.url ? (
                <p id="favicon-url-error" className="text-sm text-error">
                  {errors.favicon.url.message}
                </p>
              ) : null}
            </div>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4 border-t border-border pt-8">
            <h3 className={sectionTitle}>{t("sectionContact")}</h3>

            <div className="space-y-2">
                <Label htmlFor="phone">{t("labels.phone")}</Label>
                <Input
                  id="phone"
                  dir="ltr"
                  placeholder={t("placeholders.phone")}
                  {...register("phone")}
                />
              </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("labels.email")}</Label>
              <Input
                id="email"
                dir="ltr"
                type="email"
                placeholder={t("placeholders.email")}
                {...register("email")}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="instagram">{t("labels.instagram")}</Label>
                <Input
                  id="instagram"
                  dir="ltr"
                  placeholder={t("placeholders.instagram")}
                  {...register("instagram")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">{t("labels.facebook")}</Label>
                <Input
                  id="facebook"
                  dir="ltr"
                  placeholder={t("placeholders.facebook")}
                  {...register("facebook")}
                />
              </div>
            </div>
          </div>

          {/* Branches */}
          <div className="space-y-4 border-t border-border pt-8">
            <h3 className={sectionTitle}>{t("sectionBranches")}</h3>

            {branchFields.length > 0 ? (
              <div className="space-y-4">
                {branchFields.map((branch, branchIndex) => {
                  const branchError = errors.branches?.[branchIndex];
                  return (
                    <div
                      key={branch.id}
                      className="rounded-2xl border border-border bg-muted/30 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">
                          {t("branchCard", {number: branchIndex + 1})}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={disabled}
                          onClick={() => removeBranch(branchIndex)}
                          className="text-error hover:bg-error/10 hover:text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t("removeBranch")}
                        </Button>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`branches.${branchIndex}.name.ar`}>
                            {t("labels.branchNameAr")}
                          </Label>
                          <Input
                            id={`branches.${branchIndex}.name.ar`}
                            dir="rtl"
                            placeholder={t("placeholders.branchNameAr")}
                            aria-invalid={branchError?.name?.ar ? "true" : undefined}
                            {...register(`branches.${branchIndex}.name.ar`)}
                          />
                          {branchError?.name?.ar ? (
                            <p className="text-sm text-error">
                              {branchError.name.ar.message}
                            </p>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`branches.${branchIndex}.name.en`}>
                            {t("labels.branchNameEn")}
                          </Label>
                          <Input
                            id={`branches.${branchIndex}.name.en`}
                            dir="ltr"
                            placeholder={t("placeholders.branchNameEn")}
                            aria-invalid={branchError?.name?.en ? "true" : undefined}
                            {...register(`branches.${branchIndex}.name.en`)}
                          />
                          {branchError?.name?.en ? (
                            <p className="text-sm text-error">
                              {branchError.name.en.message}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`branches.${branchIndex}.address.ar`}>
                            {t("labels.branchAddressAr")}
                          </Label>
                          <Textarea
                            id={`branches.${branchIndex}.address.ar`}
                            dir="rtl"
                            placeholder={t("placeholders.branchAddressAr")}
                            rows={2}
                            {...register(`branches.${branchIndex}.address.ar`)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`branches.${branchIndex}.address.en`}>
                            {t("labels.branchAddressEn")}
                          </Label>
                          <Textarea
                            id={`branches.${branchIndex}.address.en`}
                            dir="ltr"
                            placeholder={t("placeholders.branchAddressEn")}
                            rows={2}
                            {...register(`branches.${branchIndex}.address.en`)}
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`branches.${branchIndex}.phone`}>
                            {t("labels.branchPhone")}
                          </Label>
                          <Input
                            id={`branches.${branchIndex}.phone`}
                            dir="ltr"
                            placeholder={t("placeholders.phone")}
                            aria-invalid={branchError?.phone ? "true" : undefined}
                            {...register(`branches.${branchIndex}.phone`)}
                          />
                          {branchError?.phone ? (
                            <p className="text-sm text-error">
                              {branchError.phone.message}
                            </p>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`branches.${branchIndex}.mapUrl`}>
                            {t("labels.branchLocationLink")}
                          </Label>
                          <Input
                            id={`branches.${branchIndex}.mapUrl`}
                            dir="ltr"
                            placeholder={t("placeholders.locationLink")}
                            aria-invalid={branchError?.mapUrl ? "true" : undefined}
                            {...register(`branches.${branchIndex}.mapUrl`)}
                          />
                          {branchError?.mapUrl ? (
                            <p className="text-sm text-error">
                              {branchError.mapUrl.message}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => appendBranch({...emptyBranch})}
            >
              <Plus className="h-4 w-4" />
              {t("addBranch")}
            </Button>

            <p className="text-sm text-muted-foreground">{t("branchHint")}</p>
          </div>

          {/* Location & Hours */}
          <div className="space-y-4 border-t border-border pt-8">
            <h3 className={sectionTitle}>{t("sectionLocation")}</h3>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="openingHours.ar">{t("labels.openingHoursAr")}</Label>
                <Textarea
                  id="openingHours.ar"
                  dir="rtl"
                  placeholder={t("placeholders.openingHoursAr")}
                  {...register("openingHours.ar")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="openingHours.en">{t("labels.openingHoursEn")}</Label>
                <Textarea
                  id="openingHours.en"
                  dir="ltr"
                  placeholder={t("placeholders.openingHoursEn")}
                  {...register("openingHours.en")}
                />
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4 border-t border-border pt-8">
            <h3 className={sectionTitle}>{t("sectionMessages")}</h3>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactMessage.ar">{t("labels.contactMessageAr")}</Label>
                <Textarea
                  id="contactMessage.ar"
                  dir="rtl"
                  placeholder={t("placeholders.contactMessageAr")}
                  {...register("contactMessage.ar")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactMessage.en">{t("labels.contactMessageEn")}</Label>
                <Textarea
                  id="contactMessage.en"
                  dir="ltr"
                  placeholder={t("placeholders.contactMessageEn")}
                  {...register("contactMessage.en")}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-8 sm:flex-row sm:justify-end">
            <Button type="submit" disabled={disabled}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {t("submit")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
