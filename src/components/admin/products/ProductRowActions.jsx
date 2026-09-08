"use client";

import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {Loader2, Power, Star, Trash2, Pencil} from "lucide-react";
import {Button} from "@/components/ui/Button";

export function ProductRowActions({productId, isActive, isFeatured, locale}) {
  const t = useTranslations("admin.products");
  const router = useRouter();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const run = async (action, options) => {
    setBusy(action);
    setError(null);
    try {
      const response = await fetch(options.url, {
        method: options.method,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(options.body),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (data?.error === "UNAUTHORIZED") {
          router.replace("/admin/login");
        } else {
          setError(t("actionError"));
        }
        return;
      }

      router.refresh();
    } catch {
      setError(t("actionError"));
    } finally {
      setBusy(null);
    }
  };

  const handleToggleActive = () => {
    setError(null);
    run("active", {
      url: `/api/admin/products/${productId}/activate`,
      method: "PATCH",
      body: {isActive: !isActive},
    });
  };

  const handleToggleFeatured = () => {
    setError(null);
    run("feature", {
      url: `/api/admin/products/${productId}/feature`,
      method: "PATCH",
      body: {isFeatured: !isFeatured},
    });
  };

  const handleDelete = () => {
    if (!window.confirm(t("confirmDelete"))) {
      return;
    }
    setError(null);
    run("delete", {
      url: `/api/admin/products/${productId}`,
      method: "DELETE",
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/${locale}/admin/products/${productId}/edit`}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-sm font-extrabold uppercase tracking-wide transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-9 sm:rounded-lg"
          aria-label={t("edit")}
        >
          <Pencil className="h-4 w-4" />
          {t("edit")}
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="h-11 px-2.5 sm:h-9"
          onClick={handleToggleActive}
          disabled={busy !== null}
          aria-label={t("toggleActive")}
          title={t("toggleActive")}
        >
          {busy === "active" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Power className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-11 px-2.5 sm:h-9"
          onClick={handleToggleFeatured}
          disabled={busy !== null}
          aria-label={t("toggleFeatured")}
          title={t("toggleFeatured")}
        >
          {busy === "feature" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Star
              className={`h-4 w-4 ${isFeatured ? "fill-brand text-brand" : ""}`}
            />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-11 border-error/40 px-2.5 text-error hover:bg-error/10 hover:text-error sm:h-9"
          onClick={handleDelete}
          disabled={busy !== null}
          aria-label={t("delete")}
          title={t("delete")}
        >
          {busy === "delete" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 rtl:-scale-x-100" />
          )}
        </Button>
      </div>
      {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}
    </div>
  );
}