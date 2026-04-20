export const NOW_HEARTLINE_CONFIG = {
  sampleCount: 56,
  viewboxWidth: 100,
  viewboxHeight: 100,
  waveIntervalMs: 160,
  phaseStep: 0.02,
  bpmIntervalMs: 2200,
} as const;

export function getHeartRateDisplayState(connected: boolean, bpm: number) {
  if (!connected) {
    return {
      connected: false,
      bpmText: "--",
      ariaLabel: "未连接到服务器",
      statusPrimary: "未连接",
      statusSecondary: "服务器",
    } as const;
  }

  return {
    connected: true,
    bpmText: String(bpm),
    ariaLabel: `${bpm} bpm`,
    statusPrimary: "Live",
    statusSecondary: "Steady",
  } as const;
}

function waveValueAt(position: number, phase: number) {
  const progress = (position + phase) % 1;
  const baseline =
    0.56 +
    Math.sin((position + phase * 0.35) * Math.PI * 4) * 0.006 +
    Math.sin(progress * Math.PI * 10) * 0.012 +
    Math.cos((progress + 0.08) * Math.PI * 3) * 0.004;

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

export function buildWavePath(phase: number) {
  const { sampleCount, viewboxWidth, viewboxHeight } = NOW_HEARTLINE_CONFIG;

  const points = Array.from({ length: sampleCount }, (_, index) => {
    const x = (index / (sampleCount - 1)) * viewboxWidth;
    const position = index / (sampleCount - 1);
    const y = waveValueAt(position, phase) * viewboxHeight;
    return { x, y };
  });

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ");

  return { linePath, points };
}
