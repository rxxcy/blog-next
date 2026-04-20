export type TimeProgressLabel =
  | "Today"
  | "This Week"
  | "This Month"
  | "This Year";

export type TimeProgressItem = {
  label: TimeProgressLabel;
  progress: number;
};

export type TodayProgressAccent = {
  markerPosition: number;
  glowStart: number;
  glowWidth: number;
};

function clampProgress(value: number) {
  return Math.min(1, Math.max(0, value));
}

function padTimeUnit(value: number) {
  return value.toString().padStart(2, "0");
}

function getRangeProgress(now: Date, start: Date, end: Date) {
  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();

  if (total <= 0) {
    return 0;
  }

  return clampProgress(elapsed / total);
}

function getWeekStart(date: Date) {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const weekOffset = day === 0 ? 6 : day - 1;

  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekOffset);

  return weekStart;
}

export function formatProgressPercent(progress: number) {
  return `${(clampProgress(progress) * 100).toFixed(2)}%`;
}

export function getTodayRemainingMs(now: Date) {
  const nextDayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );

  return Math.max(0, nextDayStart.getTime() - now.getTime());
}

export function getTodayProgressAccent(progress: number): TodayProgressAccent {
  const clampedPercent = clampProgress(progress) * 100;
  const markerPosition = Math.min(99.25, Math.max(0.75, clampedPercent));
  const glowStart = Math.max(0, markerPosition - 6);

  return {
    markerPosition,
    glowStart,
    glowWidth: markerPosition - glowStart,
  };
}

export function formatRemainingTimeLeft(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${padTimeUnit(hours)}:${padTimeUnit(minutes)}:${padTimeUnit(seconds)} left`;
}

export function getTimeProgressItems(now: Date): TimeProgressItem[] {
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  const todayStart = new Date(year, month, date);
  const tomorrowStart = new Date(year, month, date + 1);
  const weekStart = getWeekStart(now);
  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);

  const monthStart = new Date(year, month, 1);
  const nextMonthStart = new Date(year, month + 1, 1);
  const yearStart = new Date(year, 0, 1);
  const nextYearStart = new Date(year + 1, 0, 1);

  return [
    {
      label: "Today",
      progress: getRangeProgress(now, todayStart, tomorrowStart),
    },
    {
      label: "This Week",
      progress: getRangeProgress(now, weekStart, nextWeekStart),
    },
    {
      label: "This Month",
      progress: getRangeProgress(now, monthStart, nextMonthStart),
    },
    {
      label: "This Year",
      progress: getRangeProgress(now, yearStart, nextYearStart),
    },
  ];
}
