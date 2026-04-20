import type { Metadata } from "next";
import { NowCurrentSoftware } from "@/components/now-current-software";
import { NowHeartline } from "@/components/now-heartline";
import { NowTimeProgress } from "@/components/now-time-progress";
import { readNowSoftwareIcons } from "@/lib/now-current-software-server";
import { getHeartRateDisplayState } from "@/lib/now-heartline";

export const metadata: Metadata = {
  title: "Now",
  description: "当前状态静态预演。",
};

export default async function NowPage() {
  const softwareIcons = await readNowSoftwareIcons();
  const initialTimestamp = Date.now();
  const heartRateConnected = false;
  const heartRateBpm = 72;
  const heartRateDisplay = getHeartRateDisplayState(
    heartRateConnected,
    heartRateBpm,
  );

  return (
    <section className="space-y-6 px-4 pb-4 md:px-0">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground text-right">此刻</p>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Heart Rate
            </p>
            <h1 className="font-mono text-[clamp(3.2rem,12vw,7rem)] font-semibold leading-none tracking-[-0.08em] text-foreground">
              {heartRateDisplay.bpmText}{" "}
              <span className="text-[0.36em] tracking-[-0.04em] text-muted-foreground">
                BPM
              </span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{heartRateDisplay.statusPrimary}</span>
            <span aria-hidden="true">/</span>
            <span>{heartRateDisplay.statusSecondary}</span>
          </div>
        </div>
      </header>

      <section className="py-1">
        <NowHeartline bpm={heartRateBpm} connected={heartRateConnected} />
      </section>

      <div className="h-px bg-border/60" />

      <section className="space-y-3 py-2">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Current
          </p>
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <NowCurrentSoftware icons={softwareIcons} />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>Focused</span>
              <span aria-hidden="true">/</span>
              <span>23 min</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3 py-2">
        <div className="space-y-2">
          <NowTimeProgress initialTimestamp={initialTimestamp} />
        </div>
      </section>
    </section>
  );
}
