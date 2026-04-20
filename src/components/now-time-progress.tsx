"use client";

import { useEffect, useState } from "react";
import {
  formatProgressPercent,
  formatRemainingTimeLeft,
  getTimeProgressItems,
  getTodayProgressAccent,
  getTodayRemainingMs,
} from "@/lib/now-time-progress";

type NowTimeProgressProps = {
  initialTimestamp: number;
};

const NOW_TIME_PROGRESS_INTERVAL_MS = 1000;

export function NowTimeProgress({ initialTimestamp }: NowTimeProgressProps) {
  const [now, setNow] = useState(() => new Date(initialTimestamp));

  useEffect(() => {
    setNow(new Date());

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, NOW_TIME_PROGRESS_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const items = getTimeProgressItems(now);
  const todayRemainingText = formatRemainingTimeLeft(getTodayRemainingMs(now));

  return (
    <div className="space-y-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Progress
      </p>
      <div className="space-y-3">
        {items.map((item) => {
          const value = Number((item.progress * 100).toFixed(2));
          const isToday = item.label === "Today";
          const accent = isToday ? getTodayProgressAccent(item.progress) : null;

          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <div className="flex min-w-0 items-end gap-2">
                  <span className="leading-none text-foreground">
                    {item.label}
                  </span>
                  {isToday ? (
                    <span className="font-mono text-[11px] leading-none text-muted-foreground/85">
                      {todayRemainingText}
                    </span>
                  ) : null}
                </div>
                <span className="font-mono text-[13px] text-muted-foreground">
                  {formatProgressPercent(item.progress)}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={item.label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={value}
                className="relative h-1 w-full overflow-hidden rounded-full bg-border/60"
              >
                <div
                  className="h-full rounded-full bg-foreground/70 transition-[width] duration-700 ease-out motion-reduce:transition-none"
                  style={{ width: `${item.progress * 100}%` }}
                />
                {accent ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 bg-linear-to-r from-transparent via-foreground/45 to-foreground/80 transition-[left,width] duration-700 ease-out motion-reduce:transition-none"
                    style={{
                      left: `${accent.glowStart}%`,
                      width: `${accent.glowWidth}%`,
                    }}
                  />
                ) : null}
                {accent ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 h-2 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-[0_0_8px_rgba(255,255,255,0.16)] transition-[left] duration-700 ease-out motion-reduce:transition-none"
                    style={{ left: `${accent.markerPosition}%` }}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
