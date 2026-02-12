"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/notes", label: "笔记" },
  { href: "/projects", label: "项目" },
  { href: "/moments", label: "瞬间" },
  { href: "/albums", label: "相册" },
];

const mobileNavItems = [
  { href: "/", label: "首页" },
  { href: "/notes", label: "笔记" },
  { href: "/projects", label: "项目" },
  { href: "/moments", label: "瞬间" },
  { href: "/albums", label: "相册" },
];

export function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let frameId = 0;

    const handleScroll = () => {
      if (frameId) return;

      frameId = window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;
        const isScrolled = currentY > 8;
        setScrolled((prev) => (prev === isScrolled ? prev : isScrolled));

        if (currentY <= 24) {
          setHidden(false);
        } else if (delta > 8) {
          setHidden(true);
        } else if (delta < -8) {
          setHidden(false);
        }

        lastScrollY.current = currentY;
        frameId = 0;
      });
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-transform duration-300 motion-reduce:transition-none ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <nav
        aria-label="Primary"
        className={`mx-auto flex h-14 w-full max-w-4xl items-center transition-all duration-300 md:justify-between motion-reduce:transition-none ${
          scrolled
            ? "mt-2 rounded-full border border-transparent bg-background/84 px-4 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45),0_1px_0_rgba(255,255,255,0.55)] ring-0 backdrop-blur-md"
            : "border-transparent bg-transparent px-6"
        }`}
      >
        <Link
          href="/"
          aria-label="返回首页"
          className="hidden items-center gap-2 md:flex"
        >
          <Image
            src="https://cat.cf.51111111.xyz/landscape/webp/20260212-fcf96545.webp"
            alt="Logo"
            width={28}
            height={28}
            className="rounded-full"
            priority
          />
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2">
          <NavLinks
            items={navItems}
            className="hidden items-center gap-2 md:flex"
          />
          <NavLinks
            items={mobileNavItems}
            className="flex w-full items-center md:hidden"
            itemClassName="flex-1 text-center"
          />
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
