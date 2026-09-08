import {getTranslations} from "next-intl/server";
import Link from "next/link";
import {Pencil, Plus, Sandwich} from "lucide-react";
import {requireAdmin} from "@/lib/requireAdmin";
import {getAdminAddOns} from "@/lib/data/adminAddOns";
import {Badge} from "@/components/ui/Badge";
import {EmptyState} from "@/components/ui/EmptyState";
import {AddOnRowActions} from "@/components/admin/addons/AddOnRowActions";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("admin.addons");
  return {title: t("metaTitle")};
}

function priceLabel(addOn) {
  if (addOn.priceMode === "bySize") {
    const parts = [];
    for (const size of ["S", "M", "L"]) {
      const value = addOn.sizePrices?.[size];
      if (typeof value === "number") {
        parts.push(`${size}: ${value}`);
      }
    }
    return parts.join(" · ");
  }
  return typeof addOn.price === "number" ? String(addOn.price) : "—";
}

export default async function AdminAddOnsPage({params}) {
  const {locale} = await params;

  await requireAdmin(locale);

  const t = await getTranslations("admin.addons");
  const addOns = await getAdminAddOns();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-1 text-muted-foreground">{t("description")}</p>
        </div>
        <Link
          href={`/${locale}/admin/addons/new`}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus className="h-4 w-4" />
          {t("createNew")}
        </Link>
      </div>

      {addOns.length === 0 ? (
        <EmptyState
          icon={<Sandwich className="h-8 w-8" />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <div className="space-y-3">
          <div className="hidden items-center justify-between border-b border-border pb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:flex">
            <span className="flex-1">{t("name")}</span>
            <span className="w-44 text-center">{t("price")}</span>
            <span className="w-32 text-center">{t("status")}</span>
            <span className="shrink-0 text-end">{t("actions")}</span>
          </div>

          {addOns.map((addOn) => (
            <div
              key={addOn.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="truncate font-bold tracking-tight">
                    {addOn.name.en}
                  </h3>
                  {addOn.name.ar ? (
                    <span className="text-sm text-muted-foreground">
                      {addOn.name.ar}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {addOn.priceMode === "bySize"
                    ? t("bySizeLabel")
                    : t("flatLabel")}
                </p>
              </div>

              <div className="w-44 shrink-0 text-sm font-medium tabular-nums sm:text-center">
                {priceLabel(addOn)} {t("currency")}
              </div>

              <div className="flex w-32 shrink-0 items-center justify-start sm:justify-center">
                <Badge variant={addOn.isActive ? "default" : "secondary"}>
                  {addOn.isActive ? t("active") : t("inactive")}
                </Badge>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                <Link
                  href={`/${locale}/admin/addons/${addOn.id}/edit`}
                  className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-sm font-extrabold uppercase tracking-wide transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-9 sm:rounded-lg"
                  aria-label={t("edit")}
                >
                  <Pencil className="h-4 w-4" />
                  {t("edit")}
                </Link>
                <AddOnRowActions
                  addOnId={addOn.id}
                  isActive={addOn.isActive}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}