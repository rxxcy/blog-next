"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const DOT_COUNT = 14;
const DOT_STEPS = Array.from({ length: DOT_COUNT }, (_, step) => step);

export function ReadingProgressDots() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const root = document.documentElement;
      const scrollableHeight = Math.max(
        1,
        root.scrollHeight - window.innerHeight,
      );
      const progress = Math.min(
        1,
        Math.max(0, window.scrollY / scrollableHeight),
      );
      const nextActiveIndex = Math.round(progress * (DOT_COUNT - 1));
      setActiveIndex((current) =>
        current === nextActiveIndex ? current : nextActiveIndex,
      );
    };

    const onScrollOrResize = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return (
    <aside
      aria-hidden="true"
      className="pointer-events-none fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 lg:flex"
    >
      <div className="flex flex-col gap-2">
        {DOT_STEPS.map((step) => {
          const active = step <= activeIndex;
          const current = step === activeIndex;
          return (
            <span
              key={`reading-progress-${step}`}
              className={cn(
                "relative h-1 w-1 rounded-full transition-all duration-200 motion-reduce:transition-none",
                active
                  ? "bg-emerald-500/90 shadow-[0_0_8px_rgba(16,185,129,0.45)] dark:bg-emerald-400/85 dark:shadow-[0_0_8px_rgba(52,211,153,0.35)]"
                  : "bg-foreground/15 dark:bg-foreground/20",
                current
                  ? "after:absolute after:inset-[-3px] after:rounded-full after:border after:border-emerald-400/60 after:content-[''] after:animate-ping motion-reduce:after:hidden dark:after:border-emerald-300/45"
                  : "",
              )}
            />
          );
        })}
      </div>
    </aside>
  );
}
