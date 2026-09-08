import Image from "next/image";
import {getTranslations} from "next-intl/server";
import {Link} from "@/i18n/navigation";
import {LocaleSwitcher} from "./LocaleSwitcher";
import {ThemeToggle} from "./ThemeToggle";
import {MobileMenu} from "./MobileMenu";
import {MainNav} from "./MainNav";

export async function Header({settings = null}) {
  const t = await getTranslations("common");
  const brandName = settings?.brandName || t("appName");
  const logo = settings?.logo;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-surface/95 shadow-clay-sm backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:h-20 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-6">
          <Link
            href="/"
            className="inline-flex min-h-11 min-w-11 max-w-[45vw] items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {logo?.url ? (
              <Image
                src={logo.url}
                alt={logo.alt || brandName}
                width={144}
                height={36}
                sizes="(max-width: 640px) 96px, 144px"
                className="h-9 w-auto object-contain"
              />
            ) : (
              <span className="truncate text-base font-display sm:text-lg">
                {brandName}
              </span>
            )}
          </Link>
          <MainNav className="hidden lg:flex" />
        </div>
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}