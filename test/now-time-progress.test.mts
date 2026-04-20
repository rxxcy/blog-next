import assert from "node:assert/strict";
import test from "node:test";

import {
  formatProgressPercent,
  formatRemainingTimeLeft,
  getTimeProgressItems,
  getTodayProgressAccent,
  getTodayRemainingMs,
} from "../src/lib/now-time-progress.ts";

test("getTimeProgressItems returns aligned progress for a mid-morning timestamp", () => {
  const now = new Date(2026, 3, 8, 10, 30, 0, 0);
  const items = getTimeProgressItems(now);

  assert.deepEqual(
    items.map((item) => item.label),
    ["Today", "This Week", "This Month", "This Year"],
  );

  assert.equal(items[0]?.progress, 0.4375);
  assert.equal(items[1]?.progress, 2.4375 / 7);
  assert.equal(items[2]?.progress, 7.4375 / 30);
  assert.equal(items[3]?.progress, 97.4375 / 365);
});

test("getTimeProgressItems treats Monday as the start of the week", () => {
  const now = new Date(2026, 3, 6, 0, 0, 0, 0);
  const items = getTimeProgressItems(now);

  assert.equal(items[1]?.progress, 0);
});

test("getTimeProgressItems respects leap-year boundaries", () => {
  const now = new Date(2024, 1, 29, 12, 0, 0, 0);
  const items = getTimeProgressItems(now);

  assert.equal(items[2]?.progress, 28.5 / 29);
  assert.equal(items[3]?.progress, 59.5 / 366);
});

test("formatProgressPercent clamps and formats to two decimal places", () => {
  assert.equal(formatProgressPercent(0), "0.00%");
  assert.equal(formatProgressPercent(0.1), "10.00%");
  assert.equal(formatProgressPercent(1.2), "100.00%");
});

test("getTodayRemainingMs returns the milliseconds until next midnight", () => {
  const now = new Date(2026, 3, 8, 10, 30, 0, 0);

  assert.equal(getTodayRemainingMs(now), 13.5 * 60 * 60 * 1000);
});

test("formatRemainingTimeLeft returns a hh:mm:ss countdown label", () => {
  assert.equal(formatRemainingTimeLeft(13.5 * 60 * 60 * 1000), "13:30:00 left");
  assert.equal(formatRemainingTimeLeft(999), "00:00:01 left");
  assert.equal(formatRemainingTimeLeft(0), "00:00:00 left");
});

test("getTodayRemainingMs uses the same day boundary as Today progress", () => {
  const now = new Date(2026, 3, 8, 23, 59, 59, 0);
  const items = getTimeProgressItems(now);

  assert.equal(
    formatRemainingTimeLeft(getTodayRemainingMs(now)),
    "00:00:01 left",
  );
  assert.equal(items[0]?.progress, 86399 / 86400);
});

test("getTodayProgressAccent returns a clamped marker and short trailing glow", () => {
  assert.deepEqual(getTodayProgressAccent(0.5), {
    markerPosition: 50,
    glowStart: 44,
    glowWidth: 6,
  });
});

test("getTodayProgressAccent clamps the marker and glow near the edges", () => {
  assert.deepEqual(getTodayProgressAccent(-1), {
    markerPosition: 0.75,
    glowStart: 0,
    glowWidth: 0.75,
  });

  assert.deepEqual(getTodayProgressAccent(2), {
    markerPosition: 99.25,
    glowStart: 93.25,
    glowWidth: 6,
  });
});
