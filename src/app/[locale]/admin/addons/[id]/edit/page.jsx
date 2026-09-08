import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {requireAdmin} from "@/lib/requireAdmin";
import {getAdminAddOnById} from "@/lib/data/adminAddOns";
import {AddOnForm} from "@/components/admin/addons/AddOnForm";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("admin.addOnForm");
  return {title: t("editTitle")};
}

export default async function EditAddOnPage({params}) {
  const {locale, id} = await params;

  await requireAdmin(locale);

  const t = await getTranslations("admin.addOnForm");
  const addOn = await getAdminAddOnById(id);

  if (!addOn) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("editTitle")}
      </h2>
      <AddOnForm mode="edit" addon={addOn} locale={locale} />
    </div>
  );
}