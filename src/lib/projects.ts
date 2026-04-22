import fs from "node:fs/promises";
import path from "node:path";

export type ProjectCategory = "Web" | "Tool" | "Experiment";
export type ProjectStatus = "planned" | "in_progress" | "done";

export type ProjectItem = {
  id: string;
  title: string;
  summary: string;
  year: number;
  category: ProjectCategory;
  status: ProjectStatus;
  tags: string[];
  repo?: string;
  demo?: string;
};

type ReadProjectsOptions = {
  rootDir?: string;
};

const PROJECTS_FILE_PATH = ["content", "projects", "projects.json"] as const;
const PROJECT_CATEGORIES = new Set<ProjectCategory>([
  "Web",
  "Tool",
  "Experiment",
]);
const PROJECT_STATUSES = new Set<ProjectStatus>([
  "planned",
  "in_progress",
  "done",
]);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeOptionalUrl(value: unknown) {
  if (!isNonEmptyString(value)) return undefined;
  return value.trim();
}

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) return null;

  const tags = value
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter(Boolean);

  return tags.length > 0 ? tags : null;
}

function parseProjectItem(value: unknown): ProjectItem | null {
  if (!value || typeof value !== "object") return null;

  const item = value as Record<string, unknown>;
  const id = isNonEmptyString(item.id) ? item.id.trim() : "";
  const title = isNonEmptyString(item.title) ? item.title.trim() : "";
  const summary = isNonEmptyString(item.summary) ? item.summary.trim() : "";
  const year =
    typeof item.year === "number" && Number.isInteger(item.year)
      ? item.year
      : NaN;
  const category = item.category;
  const status = item.status;
  const tags = normalizeTags(item.tags);

  if (!id || !title || !summary || !Number.isFinite(year) || !tags) {
    return null;
  }

  if (!PROJECT_CATEGORIES.has(category as ProjectCategory)) {
    return null;
  }

  if (!PROJECT_STATUSES.has(status as ProjectStatus)) {
    return null;
  }

  const repo = normalizeOptionalUrl(item.repo);
  const demo = normalizeOptionalUrl(item.demo);

  return {
    id,
    title,
    summary,
    year,
    category: category as ProjectCategory,
    status: status as ProjectStatus,
    tags,
    ...(repo ? { repo } : {}),
    ...(demo ? { demo } : {}),
  };
}

function getProjectsFilePath(rootDir: string) {
  return path.join(rootDir, ...PROJECTS_FILE_PATH);
}

export async function readProjects(options: ReadProjectsOptions = {}) {
  const rootDir = options.rootDir ?? process.cwd();
  const projectsFilePath = getProjectsFilePath(rootDir);

  let raw: string;
  try {
    raw = await fs.readFile(projectsFilePath, "utf8");
  } catch {
    return [] as ProjectItem[];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return [] as ProjectItem[];
  }

  if (!Array.isArray(parsed)) {
    return [] as ProjectItem[];
  }

  return parsed
    .map((item) => parseProjectItem(item))
    .filter((item): item is ProjectItem => item !== null);
}
