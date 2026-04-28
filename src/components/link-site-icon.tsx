"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type LinkSiteIconProps = {
  title: string;
  src?: string;
  domain?: string;
  className?: string;
};

function getMonogram(title: string, domain?: string) {
  const source = domain?.replace(/^www\./, "") ?? title;
  const firstCharacter = source.trim().charAt(0).toUpperCase();
  return firstCharacter || title.trim().charAt(0).toUpperCase() || "?";
}

export function LinkSiteIcon({
  title,
  src,
  domain,
  className,
}: LinkSiteIconProps) {
  const [broken, setBroken] = useState(false);
  const monogram = getMonogram(title, domain);
  const showImage = Boolean(src) && !broken;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-sm font-medium text-foreground/80",
        className,
      )}
    >
      {showImage ? (
        // biome-ignore lint/performance/noImgElement: this component accepts user-provided favicon URLs without requiring Next image config.
        <img
          src={src}
          alt=""
          className="h-5 w-5 object-contain"
          loading="lazy"
          onError={() => setBroken(true)}
        />
      ) : (
        <span>{monogram}</span>
      )}
    </div>
  );
}
