"use client";

import { useEffect, useState } from "react";
import {
  resolveActiveHeadingId,
  type TocHeadingMeasurement,
} from "@/lib/notes-toc";
import { cn } from "@/lib/utils";

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

const HEADING_OFFSET = 120;
const SHOW_TOP_AFTER_PX = 480;

function collectTocItems() {
  const headings = Array.from(
    document.querySelectorAll<HTMLElement>(
      ".mdx-content h2[id], .mdx-content h3[id]",
    ),
  );

  return headings
    .map((heading) => {
      const id = heading.id.trim();
      const text = heading.textContent?.trim() ?? "";
      const level = heading.tagName === "H2" ? 2 : 3;
      if (!id || !text) return null;
      return { id, text, level } satisfies TocItem;
    })
    .filter((item): item is TocItem => item !== null);
}

function readHeadingMeasurements(items: TocItem[]) {
  const measurements: TocHeadingMeasurement[] = [];

  for (const item of items) {
    const element = document.getElementById(item.id);
    if (!element) continue;
    measurements.push({
      id: item.id,
      top: element.offsetTop,
      height: element.offsetHeight,
    });
  }

  return measurements;
}

function getActiveHeading(items: TocItem[]) {
  if (items.length === 0) return "";

  return resolveActiveHeadingId(readHeadingMeasurements(items), {
    scrollY: window.scrollY,
    viewportHeight: window.innerHeight,
    documentHeight: document.documentElement.scrollHeight,
    headingOffset: HEADING_OFFSET,
  });
}

export function NotesToc() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState("");
  const [showTopButton, setShowTopButton] = useState(false);

  const handleScrollToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const nextItems = collectTocItems();
      setItems((current) =>
        JSON.stringify(current) === JSON.stringify(nextItems)
          ? current
          : nextItems,
      );
      setActiveId(getActiveHeading(nextItems));
      const shouldShowTopButton = window.scrollY > SHOW_TOP_AFTER_PX;
      setShowTopButton((prev) =>
        prev === shouldShowTopButton ? prev : shouldShowTopButton,
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

  if (items.length < 3) return null;

  return (
    <aside className="fixed left-[min(calc(50%+30rem),calc(100vw-14rem))] top-24 hidden w-52 xl:block">
      <div className="space-y-2 border-l border-border pl-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            TOC
          </p>
          <button
            type="button"
            onClick={handleScrollToTop}
            className={cn(
              "cursor-pointer text-[11px] uppercase tracking-wide text-muted-foreground transition-all duration-200 hover:text-foreground motion-reduce:transition-none",
              showTopButton
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-1 opacity-0",
            )}
          >
            Top
          </button>
        </div>
        <ol className="max-h-[calc(100vh-9rem)] space-y-1 overflow-y-auto pr-2">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                title={item.text}
                onClick={(event) => {
                  event.preventDefault();
                  const target = document.getElementById(item.id);
                  if (!target) return;
                  target.scrollIntoView({ behavior: "smooth", block: "start" });
                  history.replaceState(null, "", `#${item.id}`);
                }}
                className={cn(
                  "block truncate whitespace-nowrap text-xs leading-5 text-muted-foreground transition-colors",
                  item.level === 3 ? "pl-3" : "",
                  activeId === item.id
                    ? "text-foreground"
                    : "hover:text-foreground",
                )}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
