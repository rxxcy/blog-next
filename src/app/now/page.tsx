import type { Metadata } from "next";
import { NowHeartline } from "@/components/now-heartline";

export const metadata: Metadata = {
  title: "Now",
  description: "当前状态静态预演。",
};

function DefaultSoftwareIcon() {
  return (
    <div className="inline-flex flex-col items-start gap-2">
      <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-border/70 bg-foreground text-background shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)]">
        <div className="absolute inset-0 bg-linear-to-br from-foreground via-foreground to-foreground/80" />
        <div className="absolute inset-[7px] rounded-[14px] border border-background/18" />
        <div className="absolute inset-y-0 left-[52%] w-px -rotate-[24deg] bg-background/20" />
        <div className="absolute inset-0 flex items-center justify-center font-mono text-3xl font-semibold tracking-[-0.08em] text-background">
          C
        </div>
      </div>
      <span className="font-mono text-xs text-muted-foreground">Cursor</span>
    </div>
  );
}

export default function NowPage() {
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
              72{" "}
              <span className="text-[0.36em] tracking-[-0.04em] text-muted-foreground">
                BPM
              </span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>Live</span>
            <span aria-hidden="true">/</span>
            <span>Steady</span>
          </div>
        </div>
      </header>

      <section className="py-1">
        <NowHeartline bpm={72} />
      </section>

      <div className="h-px bg-border/60" />

      <section className="space-y-3 py-2">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Current
          </p>
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <DefaultSoftwareIcon />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>Focused</span>
              <span aria-hidden="true">/</span>
              <span>23 min</span>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
