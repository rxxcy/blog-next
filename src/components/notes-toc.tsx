"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

const HEADING_OFFSET = 120;

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

function getActiveHeading(items: TocItem[]) {
  if (items.length === 0) return "";

  const marker = window.scrollY + HEADING_OFFSET;
  let activeId = items[0].id;

  for (const item of items) {
    const element = document.getElementById(item.id);
    if (!element) continue;
    if (element.offsetTop <= marker) {
      activeId = item.id;
      continue;
    }
    break;
  }

  return activeId;
}

export function NotesToc() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState("");

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

  const visibleItems = useMemo(() => items.slice(0, 14), [items]);

  if (visibleItems.length < 3) return null;

  return (
    <aside className="fixed left-[min(calc(50%+30rem),calc(100vw-14rem))] top-24 hidden w-52 xl:block">
      <div className="space-y-2 border-l border-border pl-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          TOC
        </p>
        <ol className="space-y-1">
          {visibleItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  const target = document.getElementById(item.id);
                  if (!target) return;
                  target.scrollIntoView({ behavior: "smooth", block: "start" });
                  history.replaceState(null, "", `#${item.id}`);
                }}
                className={cn(
                  "block text-xs leading-5 text-muted-foreground transition-colors",
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
