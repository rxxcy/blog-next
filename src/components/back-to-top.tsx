"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const SHOW_AFTER_PX = 480;

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const updateVisibility = () => {
      const shouldShow = window.scrollY > SHOW_AFTER_PX;
      setVisible((prev) => (prev === shouldShow ? prev : shouldShow));
      ticking.current = false;
    };

    const onScroll = () => {
      if (ticking.current) {
        return;
      }
      ticking.current = true;
      window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const handleClick = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="回到顶部"
      title="回到顶部"
      onClick={handleClick}
      className={`group fixed bottom-16 right-2 z-50 h-10 w-10 cursor-pointer rounded-full p-0 transition-all duration-200 motion-reduce:transition-none ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <span
        className="relative block h-4 w-4 overflow-hidden"
        aria-hidden="true"
      >
        <ArrowUp className="absolute inset-0 h-4 w-4 translate-y-0 transition-transform duration-200 group-hover:-translate-y-full motion-reduce:transition-none" />
        <ArrowUp className="absolute inset-0 h-4 w-4 translate-y-full transition-transform duration-200 group-hover:translate-y-0 motion-reduce:transition-none" />
      </span>
    </Button>
  );
}
