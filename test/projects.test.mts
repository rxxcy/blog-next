import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { readProjects } from "../src/lib/projects.ts";

const VALID_PROJECTS = [
  {
    id: "blog",
    title: "Blog",
    summary: "内容驱动的个人站点",
    year: 2026,
    category: "Web",
    status: "in_progress",
    tags: ["Next.js", "TypeScript", "MDX"],
    repo: "https://github.com/example/blog",
  },
  {
    id: "img-pipeline",
    title: "Img Pipeline",
    summary: "批量图片处理与压缩脚本",
    year: 2024,
    category: "Tool",
    status: "done",
    tags: ["Go", "Image", "Batch"],
  },
];

async function createProjectsFixture(projects: unknown) {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "projects-fixture-"));
  const projectsDir = path.join(rootDir, "content", "projects");
  await fs.mkdir(projectsDir, { recursive: true });
  await fs.writeFile(
    path.join(projectsDir, "projects.json"),
    `${JSON.stringify(projects, null, 2)}\n`,
    "utf8",
  );
  return rootDir;
}

test("readProjects returns validated project data from projects.json", async () => {
  const rootDir = await createProjectsFixture(VALID_PROJECTS);

  const projects = await readProjects({ rootDir });

  assert.deepEqual(projects, VALID_PROJECTS);
});

test("readProjects skips invalid project entries instead of throwing", async () => {
  const rootDir = await createProjectsFixture([
    VALID_PROJECTS[0],
    {
      id: "",
      title: "Broken",
      summary: "missing id",
      year: 2026,
      category: "Web",
      status: "done",
      tags: [],
    },
    {
      id: "missing-tags",
      title: "Broken",
      summary: "missing tags",
      year: 2026,
      category: "Web",
      status: "done",
    },
  ]);

  const projects = await readProjects({ rootDir });

  assert.deepEqual(projects, [VALID_PROJECTS[0]]);
});
