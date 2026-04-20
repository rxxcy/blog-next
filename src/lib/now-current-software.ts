export const NOW_SOFTWARE_SWITCH_INTERVAL_RANGE_MS = {
  min: 1_000,
  max: 120_000,
} as const;

export const NOW_SOFTWARE_TRANSITION_DURATION_MS = 320;

export type NowSoftwareIcon = {
  src: string;
  label: string;
};

export function getSoftwareTransitionDuration() {
  return NOW_SOFTWARE_TRANSITION_DURATION_MS;
}

export function shouldAnimateSoftwareSwitch(iconCount: number) {
  return iconCount > 1;
}

export function getRandomSwitchDelay(random: () => number = Math.random) {
  const { min, max } = NOW_SOFTWARE_SWITCH_INTERVAL_RANGE_MS;
  const normalized = Math.min(Math.max(random(), 0), 1);

  return Math.round(min + normalized * (max - min));
}

export function pickNextSoftwareIndex(
  iconCount: number,
  currentIndex: number,
  random: () => number = Math.random,
) {
  if (iconCount <= 1) return 0;

  const normalized = Math.min(Math.max(random(), 0), 0.999999999999);
  const nextIndex = Math.floor(normalized * (iconCount - 1));

  return nextIndex >= currentIndex ? nextIndex + 1 : nextIndex;
}
