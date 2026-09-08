import {getTranslations} from "next-intl/server";
import {requireAdmin} from "@/lib/requireAdmin";
import {getAdminSettings} from "@/lib/data/adminSettings";
import {SettingsForm} from "@/components/admin/settings/SettingsForm";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("admin.settings");
  return {title: t("pageTitle")};
}

export default async function AdminSettingsPage({params}) {
  const {locale} = await params;

  await requireAdmin(locale);

  const [settings, t] = await Promise.all([
    getAdminSettings(),
    getTranslations("admin.settings"),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("pageTitle")}
      </h2>
      <SettingsForm settings={settings} locale={locale} />
    </div>
  );
}
