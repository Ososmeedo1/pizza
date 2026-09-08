"use client";

import {useState} from "react";
import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {usePathname} from "next/navigation";
import {signOut} from "next-auth/react";
import {
  LayoutDashboard,
  FolderTree,
  ShoppingBag,
  Sandwich,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import {cn} from "@/lib/utils";

function isActive(pathname, href, locale) {
  if (href === `/${locale}/admin`) {
    return pathname === href || pathname === `${href}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    {
      href: `/${locale}/admin`,
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
    },
    {
      href: `/${locale}/admin/categories`,
      label: t("nav.categories"),
      icon: FolderTree,
    },
    {
      href: `/${locale}/admin/products`,
      label: t("nav.products"),
      icon: ShoppingBag,
    },
    {
      href: `/${locale}/admin/addons`,
      label: t("nav.addOns"),
      icon: Sandwich,
    },
    {
      href: `/${locale}/admin/settings`,
      label: t("nav.settings"),
      icon: Settings,
    },
  ];

  const navClass = (href) =>
    cn(
      "flex h-11 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      isActive(pathname, href, locale)
        ? "bg-primary font-bold text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  const logout = () =>
    signOut({callbackUrl: `/${locale}/admin/login`});

  const navList = (
    <>
      <nav className="space-y-1" aria-label={t("nav.dashboard")}>
        {navItems.map((item) => {
          const active = isActive(pathname, item.href, locale);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={navClass(item.href)}
            >
              <item.icon className="h-5 w-5 shrink-0 rtl:-scale-x-100" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={logout}
        className={cn(
          "mt-auto flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium",
          "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <LogOut className="h-5 w-5 shrink-0 rtl:-scale-x-100" />
        {t("logout")}
      </button>
    </>
  );

  return (
    <>
      <div className="lg:hidden">
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
          <span className="text-sm font-semibold tracking-tight">
            {t("panelTitle")}
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={t("toggleMenu")}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {open ? (
          <div className="border-b border-border bg-surface px-4 py-4">
            {navList}
          </div>
        ) : null}
      </div>

      <aside className="hidden w-64 shrink-0 lg:sticky lg:top-20 lg:block lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
        <div className="flex min-h-full flex-col gap-6 border-e border-border bg-surface px-4 py-6">
          <span className="px-3 text-sm font-semibold tracking-tight">
            {t("panelTitle")}
          </span>
          {navList}
        </div>
      </aside>
    </>
  );
}