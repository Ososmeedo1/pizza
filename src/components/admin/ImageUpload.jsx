"use client";

import {useEffect, useRef, useState} from "react";
import Image from "next/image";
import {useTranslations} from "next-intl";
import {Loader2, RefreshCw, UploadCloud, X} from "lucide-react";
import {toast} from "sonner";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/Button";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function ImageUpload({
  value = "",
  onChange,
  fileId = "",
  onFileIdChange,
  altPreview = "",
  disabled = false,
  ariaDescribedBy,
}) {
  const t = useTranslations("admin.imageUpload");
  const inputRef = useRef(null);
  const dragDepth = useRef(0);
  const objectUrlRef = useRef("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const clearObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }
    setPreviewUrl("");
  };

  const hasImage = Boolean(previewUrl || value);
  const interactive = !disabled && !isUploading;

  const selectFile = () => {
    if (!interactive) {
      return;
    }
    inputRef.current?.click();
  };

  const handleFiles = (files) => {
    if (!interactive) {
      return;
    }

    const file = files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error(t("errorInvalidType"));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("errorTooLarge"));
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    const body = new FormData();
    body.append("file", file);

    fetch("/api/admin/images/upload", {method: "POST", body})
      .then(async (response) => {
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "UPLOAD_FAILED");
        }

        onChange?.(data.url);
        onFileIdChange?.(data.fileId);
      })
      .catch(() => {
        toast.error(t("errorUploadFailed"));
      })
      .finally(() => {
        clearObjectUrl();
        setIsUploading(false);
      });
  };

  const handleInputChange = (event) => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  const handleRemove = () => {
    if (!interactive) {
      return;
    }
    clearObjectUrl();
    onChange?.("");
    onFileIdChange?.("");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragActive(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    if (!interactive) {
      return;
    }
    dragDepth.current += 1;
    setIsDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragActive(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectFile();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={t("uploadPrompt")}
      aria-disabled={!interactive}
      aria-describedby={ariaDescribedBy}
      onClick={selectFile}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/50 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        interactive && !hasImage && "cursor-pointer hover:border-primary/60 hover:bg-muted",
        interactive && hasImage && "hover:border-primary/40",
        isDragActive && interactive && "border-primary/80 bg-muted",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden="true"
        disabled={!interactive}
        onChange={handleInputChange}
        className="sr-only"
      />

      {hasImage ? (
        <div className="relative h-48 w-full">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={altPreview}
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src={value}
              alt={altPreview}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 320px"
              className="object-cover"
            />
          )}
        </div>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center gap-2 px-4 text-center">
          {isUploading ? (
            <>
<Loader2 className="h-8 w-8 animate-spin text-brand" />
              <p className="text-sm font-medium text-muted-foreground">
                {t("uploading")}
              </p>
            </>
          ) : (
            <>
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                {t("uploadPrompt")}
              </p>
            </>
          )}
        </div>
      )}

      {isUploading && hasImage ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-sm font-medium text-muted-foreground">
            {t("uploading")}
          </p>
        </div>
      ) : null}

      {hasImage && !isUploading ? (
        <div className="flex items-center gap-2 border-t border-border bg-muted/50 p-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!interactive}
            onClick={(event) => {
              event.stopPropagation();
              selectFile();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            {t("replace")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!interactive}
            className="text-error hover:bg-error/10 hover:text-error"
            onClick={(event) => {
              event.stopPropagation();
              handleRemove();
            }}
          >
            <X className="h-4 w-4" />
            {t("remove")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}