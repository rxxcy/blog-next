"use client";

import { type ReactNode, useEffect, useState } from "react";

const UPDATE_INTERVAL_MS = 10 * 60 * 1000;
const NIGHT_READING_START_HOUR = 19;
const NIGHT_READING_END_HOUR = 8;

function isWithinNightReadingWindow(date: Date) {
  const hour = date.getHours();
  if (NIGHT_READING_START_HOUR < NIGHT_READING_END_HOUR) {
    return hour >= NIGHT_READING_START_HOUR && hour < NIGHT_READING_END_HOUR;
  }

  return hour >= NIGHT_READING_START_HOUR || hour < NIGHT_READING_END_HOUR;
}

export function AutoNightReading({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      const isDarkTheme = document.documentElement.classList.contains("dark");
      const inNightWindow = isWithinNightReadingWindow(new Date());
      setEnabled(isDarkTheme && inNightWindow);
    };

    evaluate();

    const timer = window.setInterval(evaluate, UPDATE_INTERVAL_MS);
    const observer = new MutationObserver(evaluate);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div className={enabled ? "reading-night-auto" : undefined}>{children}</div>
  );
}
