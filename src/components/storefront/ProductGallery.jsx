"use client";

import Image from "next/image";
import {useState} from "react";
import {Pizza} from "lucide-react";
import {cn} from "@/lib/utils";

export function ProductGallery({images = [], name = ""}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-border bg-muted">
        <Pizza className="h-12 w-12 text-brand/50" />
      </div>
    );
  }

  const current = images[activeIndex] || images[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-clay-md sm:rounded-3xl">
        <Image
          src={current.url}
          alt={current.alt || name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="flex flex-wrap gap-3">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={image.alt || name}
              aria-pressed={index === activeIndex}
              className={cn(
                "relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border bg-muted transition-colors",
                index === activeIndex
                  ? "border-primary ring-2 ring-ring"
                  : "border-border hover:border-input"
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}