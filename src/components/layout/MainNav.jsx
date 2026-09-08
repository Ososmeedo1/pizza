import {getTranslations} from "next-intl/server";
import {Link} from "@/i18n/navigation";
import {cn} from "@/lib/utils";

export async function MainNav({className}) {
  const t = await getTranslations("navigation");

  const links = [
    {href: "/", label: t("home")},
    {href: "/products", label: t("products")},
    {href: "/about", label: t("about")},
    {href: "/contact", label: t("contact")},
  ];

  return (
    <nav className={cn("items-center gap-6", className)}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}