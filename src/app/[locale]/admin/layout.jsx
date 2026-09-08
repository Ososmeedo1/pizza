import {getTranslations} from "next-intl/server";
import {getServerSession} from "next-auth";
import {Toaster} from "sonner";
import {Providers} from "@/components/admin/Providers";
import {AdminSidebar} from "@/components/admin/AdminSidebar";
import {authOptions} from "@/auth";

export async function generateMetadata() {
  const t = await getTranslations("admin");

  return {
    title: t("metaTitle"),
  };
}

export default async function AdminLayout({children}) {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("admin");

  return (
    <div className="min-h-screen bg-surface">
      <Providers session={session}>
        {session ? (
          <div className="lg:flex lg:items-start">
            <AdminSidebar />
            <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
              <h1 className="sr-only">{t("panelTitle")}</h1>
              {children}
            </main>
          </div>
        ) : (
          <main className="min-h-screen">
            <h1 className="sr-only">{t("panelTitle")}</h1>
            {children}
          </main>
        )}
      </Providers>
      <Toaster position="top-center" richColors />
    </div>
  );
}