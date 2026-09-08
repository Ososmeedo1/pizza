"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {Loader2, Power, Trash2} from "lucide-react";
import {Button} from "@/components/ui/Button";

export function CategoryRowActions({categoryId, isActive, canDelete}) {
  const t = useTranslations("admin.categories");
  const router = useRouter();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const run = async (action, options) => {
    setBusy(action);
    setError(null);
    try {
      const response = await fetch(options.url, {
        method: options.method,
        headers: options.body ? {"Content-Type": "application/json"} : undefined,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        if (data?.error === "HAS_ACTIVE_PRODUCTS") {
          setError(t("deleteErrorHasProducts"));
        } else if (data?.error === "UNAUTHORIZED") {
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

  const handleToggle = () => {
    setError(null);
    run("toggle", {
      url: `/api/admin/categories/${categoryId}/activate`,
      method: "PATCH",
      body: {isActive: !isActive},
    });
  };

  const handleDelete = () => {
    if (!canDelete) {
      setError(t("deleteErrorHasProducts"));
      return;
    }
    if (!window.confirm(t("confirmDelete"))) {
      return;
    }
    setError(null);
    run("delete", {
      url: `/api/admin/categories/${categoryId}`,
      method: "DELETE",
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-11 sm:h-9"
          onClick={handleToggle}
          disabled={busy !== null}
          aria-label={t("toggle")}
        >
          {busy === "toggle" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Power className="h-4 w-4" />
          )}
          {t("toggle")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-11 border-error/40 text-error hover:bg-error/10 hover:text-error sm:h-9"
          onClick={handleDelete}
          disabled={busy !== null}
          aria-label={canDelete ? t("delete") : t("deleteErrorHasProducts")}
        >
          {busy === "delete" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 rtl:-scale-x-100" />
          )}
          {t("delete")}
        </Button>
      </div>
      {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}
    </div>
  );
}