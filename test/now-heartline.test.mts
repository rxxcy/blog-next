import assert from "node:assert/strict";
import test from "node:test";

import {
  buildWavePath,
  getHeartRateDisplayState,
  NOW_HEARTLINE_CONFIG,
} from "../src/lib/now-heartline.ts";

function getLongestFlatRun(points: Array<{ x: number; y: number }>) {
  let maxRun = 1;
  let run = 1;

  for (let index = 1; index < points.length; index++) {
    const delta = Math.abs(points[index].y - points[index - 1].y);
    if (delta < 0.15) {
      run += 1;
      if (run > maxRun) {
        maxRun = run;
      }
      continue;
    }

    run = 1;
  }

  return maxRun;
}

test("now heartline uses a lower-frequency waveform profile", () => {
  assert.equal(NOW_HEARTLINE_CONFIG.sampleCount, 56);
  assert.equal(NOW_HEARTLINE_CONFIG.waveIntervalMs, 160);
  assert.equal(NOW_HEARTLINE_CONFIG.phaseStep, 0.02);
  assert.equal(NOW_HEARTLINE_CONFIG.bpmIntervalMs, 2200);
});

test("buildWavePath uses the configured reduced sample count", () => {
  const { points, linePath } = buildWavePath(0);

  assert.equal(points.length, NOW_HEARTLINE_CONFIG.sampleCount);
  assert.match(linePath, /^M 0\.00 /);
  assert.match(linePath, /L 100\.00 /);
});

test("buildWavePath does not produce a long visually flat segment", () => {
  const phases = [0, 0.2, 0.4];

  for (const phase of phases) {
    const { points } = buildWavePath(phase);
    const longestFlatRun = getLongestFlatRun(points);

    assert.ok(
      longestFlatRun <= 6,
      `phase ${phase} has an overly flat run of ${longestFlatRun} points`,
    );
  }
});

test("getHeartRateDisplayState returns a disconnected placeholder when server is unavailable", () => {
  assert.deepEqual(getHeartRateDisplayState(false, 72), {
    connected: false,
    bpmText: "--",
    ariaLabel: "未连接到服务器",
    statusPrimary: "未连接",
    statusSecondary: "服务器",
  });
});
