import {getTranslations} from "next-intl/server";
import {requireAdmin} from "@/lib/requireAdmin";
import {AddOnForm} from "@/components/admin/addons/AddOnForm";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("admin.addOnForm");
  return {title: t("createTitle")};
}

export default async function NewAddOnPage({params}) {
  const {locale} = await params;

  await requireAdmin(locale);

  const t = await getTranslations("admin.addOnForm");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("createTitle")}
      </h2>
      <AddOnForm mode="create" locale={locale} />
    </div>
  );
}