import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { readLinks } from "../src/lib/links.ts";

const VALID_GROUPS = {
  groups: [
    {
      category: "开发",
      description: "代码与文档",
      items: [
        {
          title: "MDN",
          url: "https://developer.mozilla.org",
          summary: "Web 参考文档",
          tags: ["Docs"],
          weight: 3,
        },
        {
          title: "GitHub",
          url: "https://github.com",
          summary: "代码托管平台",
          icon: "/image/links/github-com.svg",
          tags: ["Code", "OSS"],
          pinned: true,
          weight: 1,
        },
        {
          title: "Next.js",
          url: "https://nextjs.org",
          summary: "React 全栈框架",
          tags: ["Framework"],
          weight: 9,
        },
      ],
    },
  ],
};

async function createLinksFixture(links: unknown) {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "links-fixture-"));
  const linksDir = path.join(rootDir, "content", "links");
  await fs.mkdir(linksDir, { recursive: true });
  await fs.writeFile(
    path.join(linksDir, "links.json"),
    `${JSON.stringify(links, null, 2)}\n`,
    "utf8",
  );
  return rootDir;
}

test("readLinks returns validated groups and sorts items by priority", async () => {
  const rootDir = await createLinksFixture(VALID_GROUPS);

  const links = await readLinks({ rootDir });

  assert.deepEqual(links, [
    {
      category: "开发",
      description: "代码与文档",
      items: [
        {
          title: "GitHub",
          url: "https://github.com",
          summary: "代码托管平台",
          icon: "/image/links/github-com.svg",
          tags: ["Code", "OSS"],
          pinned: true,
          weight: 1,
        },
        {
          title: "Next.js",
          url: "https://nextjs.org",
          summary: "React 全栈框架",
          tags: ["Framework"],
          pinned: false,
          weight: 9,
        },
        {
          title: "MDN",
          url: "https://developer.mozilla.org",
          summary: "Web 参考文档",
          tags: ["Docs"],
          pinned: false,
          weight: 3,
        },
      ],
    },
  ]);
});

test("readLinks skips invalid items and drops empty groups", async () => {
  const rootDir = await createLinksFixture([
    {
      category: "AI",
      items: [
        {
          title: "OpenAI",
          url: "https://openai.com",
        },
        {
          title: "",
          url: "https://example.com",
        },
        {
          title: "Broken",
          url: "mailto:test@example.com",
        },
      ],
    },
    {
      category: "空分类",
      items: [
        {
          title: "Invalid",
          url: "not-a-url",
        },
      ],
    },
    {
      items: [
        {
          title: "Missing Category",
          url: "https://example.com",
        },
      ],
    },
  ]);

  const links = await readLinks({ rootDir });

  assert.deepEqual(links, [
    {
      category: "AI",
      items: [
        {
          title: "OpenAI",
          url: "https://openai.com",
          tags: [],
          pinned: false,
          weight: 0,
        },
      ],
    },
  ]);
});
