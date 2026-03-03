"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <div className={className}>
      {items.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              baseItemClass,
              itemClassName,
              isActive && "bg-muted text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
