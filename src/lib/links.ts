import fs from "node:fs/promises";
import path from "node:path";

export type LinkItem = {
  title: string;
  url: string;
  summary?: string;
  icon?: string;
  tags: string[];
  pinned: boolean;
  weight: number;
};

export type LinkGroup = {
  category: string;
  description?: string;
  items: LinkItem[];
};

type ReadLinksOptions = {
  rootDir?: string;
};

const LINKS_FILE_PATH = ["content", "links", "links.json"] as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeOptionalText(value: unknown) {
  if (!isNonEmptyString(value)) return undefined;
  return value.trim();
}

function normalizeExternalUrl(value: unknown) {
  if (!isNonEmptyString(value)) return undefined;

  const normalized = value.trim();

  try {
    const url = new URL(normalized);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    return normalized;
  } catch {
    return undefined;
  }
}

function normalizeIcon(value: unknown) {
  if (!isNonEmptyString(value)) return undefined;

  const normalized = value.trim();
  if (normalized.startsWith("/")) {
    return normalized;
  }

  return normalizeExternalUrl(normalized);
}

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];

  return value
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter(Boolean);
}

function normalizeWeight(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return value;
}

function parseLinkItem(value: unknown): LinkItem | null {
  if (!value || typeof value !== "object") return null;

  const item = value as Record<string, unknown>;
  const title = normalizeOptionalText(item.title);
  const url = normalizeExternalUrl(item.url);

  if (!title || !url) {
    return null;
  }

  const summary = normalizeOptionalText(item.summary);
  const icon = normalizeIcon(item.icon);

  return {
    title,
    url,
    tags: normalizeTags(item.tags),
    pinned: item.pinned === true,
    weight: normalizeWeight(item.weight),
    ...(summary ? { summary } : {}),
    ...(icon ? { icon } : {}),
  };
}

function compareLinkItems(a: LinkItem, b: LinkItem) {
  if (a.pinned !== b.pinned) {
    return a.pinned ? -1 : 1;
  }

  if (a.weight !== b.weight) {
    return b.weight - a.weight;
  }

  return a.title.localeCompare(b.title, "zh-Hans-CN");
}

function parseLinkGroup(value: unknown): LinkGroup | null {
  if (!value || typeof value !== "object") return null;

  const group = value as Record<string, unknown>;
  const category = normalizeOptionalText(group.category);

  if (!category || !Array.isArray(group.items)) {
    return null;
  }

  const items = group.items
    .map((item) => parseLinkItem(item))
    .filter((item): item is LinkItem => item !== null)
    .sort(compareLinkItems);

  if (items.length === 0) {
    return null;
  }

  const description = normalizeOptionalText(group.description);

  return {
    category,
    items,
    ...(description ? { description } : {}),
  };
}

function getLinksFilePath(rootDir: string) {
  return path.join(rootDir, ...LINKS_FILE_PATH);
}

function extractGroups(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.groups)) {
      return record.groups;
    }
  }

  return [] as unknown[];
}

export async function readLinks(
  options: ReadLinksOptions = {},
): Promise<LinkGroup[]> {
  const rootDir = options.rootDir ?? process.cwd();
  const linksFilePath = getLinksFilePath(rootDir);

  let raw: string;
  try {
    raw = await fs.readFile(linksFilePath, "utf8");
  } catch {
    return [] as LinkGroup[];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return [] as LinkGroup[];
  }

  return extractGroups(parsed)
    .map((group) => parseLinkGroup(group))
    .filter((group): group is LinkGroup => group !== null);
}
