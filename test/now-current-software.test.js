import assert from "node:assert/strict";
import test from "node:test";

import {
  getRandomSwitchDelay,
  getSoftwareTransitionDuration,
  NOW_SOFTWARE_SWITCH_INTERVAL_RANGE_MS,
  pickNextSoftwareIndex,
  shouldAnimateSoftwareSwitch,
} from "../src/lib/now-current-software.ts";

test("getRandomSwitchDelay returns a value within the configured range", () => {
  assert.equal(
    getRandomSwitchDelay(() => 0),
    NOW_SOFTWARE_SWITCH_INTERVAL_RANGE_MS.min,
  );
  assert.equal(
    getRandomSwitchDelay(() => 1),
    NOW_SOFTWARE_SWITCH_INTERVAL_RANGE_MS.max,
  );
});

test("pickNextSoftwareIndex avoids repeating the current item when multiple icons exist", () => {
  const nextIndex = pickNextSoftwareIndex(4, 2, () => 0.6);

  assert.notEqual(nextIndex, 2);
  assert.ok(nextIndex >= 0 && nextIndex < 4);
});

test("pickNextSoftwareIndex returns the only item when there is just one icon", () => {
  assert.equal(
    pickNextSoftwareIndex(1, 0, () => 0.4),
    0,
  );
});

test("getSoftwareTransitionDuration returns a short crossfade duration", () => {
  assert.equal(getSoftwareTransitionDuration(), 320);
});

test("shouldAnimateSoftwareSwitch only animates when there are at least two icons", () => {
  assert.equal(shouldAnimateSoftwareSwitch(0), false);
  assert.equal(shouldAnimateSoftwareSwitch(1), false);
  assert.equal(shouldAnimateSoftwareSwitch(2), true);
});
