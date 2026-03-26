"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

type NavLinksProps = {
  items: NavItem[];
  className?: string;
  itemClassName?: string;
};

const baseItemClass =
  "rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground motion-reduce:transition-none";

export function NavLinks({ items, className, itemClassName }: NavLinksProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const activeItem = items.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
    );

    function updateIndicator() {
      if (!activeItem) {
        setIndicatorStyle(null);
        return;
      }

      const container = containerRef.current;
      const activeElement = itemRefs.current[activeItem.href];
      if (!container || !activeElement) {
        setIndicatorStyle(null);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();

      setIndicatorStyle({
        left: activeRect.left - containerRect.left,
        top: activeRect.top - containerRect.top,
        width: activeRect.width,
        height: activeRect.height,
      });
    }

    updateIndicator();

    const resizeObserver = new ResizeObserver(updateIndicator);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    for (const item of items) {
      const element = itemRefs.current[item.href];
      if (element) resizeObserver.observe(element);
    }

    window.addEventListener("resize", updateIndicator);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [items, pathname]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {indicatorStyle ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-muted transition-[left,top,width,height] duration-250 ease-out motion-reduce:transition-none"
          style={indicatorStyle}
        />
      ) : null}
      {items.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            ref={(element) => {
              itemRefs.current[item.href] = element;
            }}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              baseItemClass,
              "relative z-10",
              itemClassName,
              isActive && "text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
