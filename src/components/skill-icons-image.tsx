"use client";

import { useEffect, useState } from "react";

type SkillIconsImageProps = {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  withBackground?: boolean;
};

export function SkillIconsImage({
  src,
  fallbackSrc,
  alt,
  className,
  withBackground = false,
}: SkillIconsImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setLoaded(false);
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden ${withBackground ? "rounded-md bg-[#F4F2ED] p-1.5 dark:bg-[#F4F2ED]" : ""} ${className ?? ""}`}
    >
      {!loaded ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-muted/60"
        />
      ) : null}

      {/* biome-ignore lint/performance/noImgElement: this component needs direct img fallback switching between custom and remote sources */}
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setLoaded(false);
            return;
          }
          setLoaded(true);
        }}
        className={`h-auto w-full object-contain transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
