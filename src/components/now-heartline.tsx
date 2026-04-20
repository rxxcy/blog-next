"use client";

import { useEffect, useState } from "react";
import {
  buildWavePath,
  getHeartRateDisplayState,
  NOW_HEARTLINE_CONFIG,
} from "@/lib/now-heartline";

type NowHeartlineProps = {
  bpm: number;
  connected: boolean;
};

const bpmSeries = [72, 73, 72, 71, 72, 74, 73, 72] as const;

export function NowHeartline({ bpm, connected }: NowHeartlineProps) {
  const [phase, setPhase] = useState(0);
  const [displayBpm, setDisplayBpm] = useState(bpm);
  const displayState = getHeartRateDisplayState(connected, displayBpm);

  useEffect(() => {
    if (!connected) {
      return;
    }

    let bpmIndex = 0;

    const waveTimer = window.setInterval(() => {
      setPhase((current) => (current + NOW_HEARTLINE_CONFIG.phaseStep) % 1);
    }, NOW_HEARTLINE_CONFIG.waveIntervalMs);

    const bpmTimer = window.setInterval(() => {
      bpmIndex = (bpmIndex + 1) % bpmSeries.length;
      setDisplayBpm(bpmSeries[bpmIndex]);
    }, NOW_HEARTLINE_CONFIG.bpmIntervalMs);

    return () => {
      window.clearInterval(waveTimer);
      window.clearInterval(bpmTimer);
    };
  }, [connected]);

  const { linePath } = buildWavePath(phase);

  if (!connected) {
    return (
      <div className="flex h-28 items-center justify-center text-sm text-muted-foreground">
        未连接到服务器
      </div>
    );
  }

  return (
    <div className="h-28">
      <svg
        viewBox={`0 0 ${NOW_HEARTLINE_CONFIG.viewboxWidth} ${NOW_HEARTLINE_CONFIG.viewboxHeight}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-label={displayState.ariaLabel}
        role="img"
      >
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-foreground"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
