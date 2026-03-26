"use client";

import { useEffect, useState } from "react";

type NowHeartlineProps = {
  bpm: number;
};

const SAMPLE_COUNT = 90;
const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 100;
const bpmSeries = [72, 73, 72, 71, 72, 74, 73, 72] as const;

function waveValueAt(position: number, phase: number) {
  const progress = (position + phase) % 1;
  const baseline =
    0.56 + Math.sin((position + phase * 0.35) * Math.PI * 5) * 0.01;

  if (progress < 0.12) return baseline;
  if (progress < 0.18) return baseline - 0.04;
  if (progress < 0.22) return baseline + 0.08;
  if (progress < 0.25) return baseline - 0.18;
  if (progress < 0.28) return 0.08;
  if (progress < 0.31) return baseline + 0.28;
  if (progress < 0.35) return baseline - 0.1;
  if (progress < 0.42) return baseline + 0.04;
  return baseline;
}

function buildWavePath(phase: number) {
  const points = Array.from({ length: SAMPLE_COUNT }, (_, index) => {
    const x = (index / (SAMPLE_COUNT - 1)) * VIEWBOX_WIDTH;
    const position = index / (SAMPLE_COUNT - 1);
    const y = waveValueAt(position, phase) * VIEWBOX_HEIGHT;
    return { x, y, key: `${x.toFixed(2)}-${y.toFixed(2)}` };
  });

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ");

  const areaPath = `${linePath} L ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT} L 0 ${VIEWBOX_HEIGHT} Z`;
  return { linePath, areaPath, points };
}

export function NowHeartline({ bpm }: NowHeartlineProps) {
  const [phase, setPhase] = useState(0);
  const [displayBpm, setDisplayBpm] = useState(bpm);

  useEffect(() => {
    let bpmIndex = 0;

    const waveTimer = window.setInterval(() => {
      setPhase((current) => (current + 0.035) % 1);
    }, 90);

    const bpmTimer = window.setInterval(() => {
      bpmIndex = (bpmIndex + 1) % bpmSeries.length;
      setDisplayBpm(bpmSeries[bpmIndex]);
    }, 1600);

    return () => {
      window.clearInterval(waveTimer);
      window.clearInterval(bpmTimer);
    };
  }, []);

  const { linePath } = buildWavePath(phase);

  return (
    <div className="h-28">
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-label={`${displayBpm} bpm`}
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
