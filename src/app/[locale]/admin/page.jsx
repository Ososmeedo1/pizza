import {getTranslations} from "next-intl/server";
import {FolderTree, ShoppingBag, Sandwich} from "lucide-react";
import {requireAdmin} from "@/lib/requireAdmin";
import {connectDB} from "@/lib/db";
import {AddOn} from "@/models/AddOn";
import {Category} from "@/models/Category";
import {Product} from "@/models/Product";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/Card";
import {Skeleton} from "@/components/ui/Skeleton";

async function getCounts() {
  try {
    await connectDB();
    const [categoryCount, productCount, addOnCount] = await Promise.all([
      Category.countDocuments(),
      Product.countDocuments(),
      AddOn.countDocuments(),
    ]);
    return {
      totalCategories: categoryCount,
      totalProducts: productCount,
      totalAddOns: addOnCount,
    };
  } catch (error) {
    console.warn(
      `dashboard counts: database unavailable (${error instanceof Error ? error.message : String(error)})`
    );
    return {totalCategories: null, totalProducts: null, totalAddOns: null};
  }
}

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("admin.dashboard");
  return {title: t("metaTitle")};
}

export default async function AdminDashboardPage({params}) {
  const {locale} = await params;

  await requireAdmin(locale);

  const t = await getTranslations("admin.dashboard");
  const counts = await getCounts();

  const stats = [
    {
      label: t("totalCategories"),
      value: counts.totalCategories,
      icon: FolderTree,
      href: `/${locale}/admin/categories`,
    },
    {
      label: t("totalProducts"),
      value: counts.totalProducts,
      icon: ShoppingBag,
      href: `/${locale}/admin/products`,
    },
    {
      label: t("totalAddOns"),
      value: counts.totalAddOns,
      icon: Sandwich,
      href: `/${locale}/admin/addons`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("welcomeTitle")}
        </h2>
        <p className="mt-2 text-muted-foreground">{t("welcomeDescription")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-border bg-background transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:shadow-clay"
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-brand rtl:-scale-x-100" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tracking-tight">
                  {stat.value === null ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    stat.value
                  )}
                </p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}