"use client";

import {useController, useWatch} from "react-hook-form";
import {cn} from "@/lib/utils";
import {ImageUpload} from "@/components/admin/ImageUpload";

export function ImageUploadField({
  control,
  name,
  altFallback = "",
  disabled = false,
  className,
  ariaDescribedBy,
}) {
  const urlField = useController({control, name: `${name}.url`});
  const fileIdField = useController({control, name: `${name}.fileId`});
  const altEn = useWatch({control, name: `${name}.alt.en`}) || "";
  const altAr = useWatch({control, name: `${name}.alt.ar`}) || "";

  const altPreview = altEn || altAr || altFallback;

  return (
    <div className={cn("w-full", className)}>
      <ImageUpload
        value={urlField.field.value || ""}
        onChange={(url) => urlField.field.onChange(url)}
        fileId={fileIdField.field.value || ""}
        onFileIdChange={(fileId) => fileIdField.field.onChange(fileId)}
        altPreview={altPreview}
        disabled={disabled}
        ariaDescribedBy={ariaDescribedBy}
      />
    </div>
  );
}