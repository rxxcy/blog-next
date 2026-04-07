import assert from "node:assert/strict";
import test from "node:test";

import { resolveActiveHeadingId } from "../src/lib/notes-toc.ts";

test("resolveActiveHeadingId returns the last heading when the page is scrolled to the bottom", () => {
  const activeId = resolveActiveHeadingId(
    [
      { id: "intro", top: 120, height: 48 },
      { id: "usage", top: 760, height: 48 },
      { id: "scenarios", top: 1180, height: 48 },
    ],
    {
      scrollY: 640,
      viewportHeight: 620,
      documentHeight: 1260,
      headingOffset: 120,
    },
  );

  assert.equal(activeId, "scenarios");
});

test("resolveActiveHeadingId prefers the first visible heading when none in view have crossed the active marker", () => {
  const activeId = resolveActiveHeadingId(
    [
      { id: "previous", top: 760, height: 48 },
      { id: "first-visible", top: 1135, height: 48 },
      { id: "second-visible", top: 1320, height: 48 },
    ],
    {
      scrollY: 1000,
      viewportHeight: 520,
      documentHeight: 2400,
      headingOffset: 120,
    },
  );

  assert.equal(activeId, "first-visible");
});
