import assert from "node:assert/strict";
import test from "node:test";
import { countPostCharacters } from "./post-stats.ts";

test("counts Chinese article text as characters instead of whitespace tokens", () => {
  const source = "## 标题\n\n你好 世界";

  assert.equal(countPostCharacters(source), 6);
});
