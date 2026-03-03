import fs from "node:fs/promises";
import path from "node:path";

export type MomentImage = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type MomentItem = {
  id: string;
  content: string;
  publishedAt: string;
  title?: string;
  source?: string;
  msgId?: string;
  images?: MomentImage[];
};

const MOMENTS_ROOT = path.join(process.cwd(), "content", "moments");
const YEAR_FILE_PATTERN = /^\d{4}\.jsonl$/;

function normalizeDate(value: unknown): string | null {
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    // Accept unix timestamp seconds or milliseconds.
    const millis = value < 1e12 ? value * 1000 : value;
    const parsed = new Date(millis);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  return null;
}

function normalizeImages(value: unknown): MomentImage[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const images: MomentImage[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const candidate = item as Record<string, unknown>;
    const src = typeof candidate.src === "string" ? candidate.src.trim() : "";
    if (!src) continue;

    const alt =
      typeof candidate.alt === "string" && candidate.alt.trim()
        ? candidate.alt.trim()
        : undefined;
    const width =
      typeof candidate.width === "number" && candidate.width > 0
        ? candidate.width
        : undefined;
    const height =
      typeof candidate.height === "number" && candidate.height > 0
        ? candidate.height
        : undefined;

    images.push({ src, alt, width, height });
  }

  return images.length > 0 ? images : undefined;
}

function normalizeMoment(value: unknown): MomentItem | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Record<string, unknown>;
  const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
  const content =
    typeof candidate.content === "string" ? candidate.content.trim() : "";
  const publishedAt = normalizeDate(candidate.publishedAt);

  if (!id || !content || !publishedAt) return null;

  const title =
    typeof candidate.title === "string" && candidate.title.trim()
      ? candidate.title.trim()
      : undefined;
  const source =
    typeof candidate.source === "string" && candidate.source.trim()
      ? candidate.source.trim()
      : undefined;
  const msgId =
    typeof candidate.msgId === "string" && candidate.msgId.trim()
      ? candidate.msgId.trim()
      : undefined;

  return {
    id,
    content,
    publishedAt,
    title,
    source,
    msgId,
    images: normalizeImages(candidate.images),
  };
}

async function readMomentsFromFile(filePath: string) {
  const raw = await fs.readFile(filePath, "utf8");
  const lines = raw.split(/\r?\n/).map((line) => line.trim());
  const moments: MomentItem[] = [];

  for (const line of lines) {
    if (!line) continue;
    try {
      const parsed = JSON.parse(line) as unknown;
      const moment = normalizeMoment(parsed);
      if (moment) moments.push(moment);
    } catch {
      // Ignore malformed lines to keep page rendering resilient.
    }
  }

  return moments;
}

function compareMoments(a: MomentItem, b: MomentItem) {
  if (a.publishedAt !== b.publishedAt) {
    return b.publishedAt.localeCompare(a.publishedAt);
  }
  return b.id.localeCompare(a.id);
}

export async function readAllMoments() {
  let files: string[] = [];
  try {
    const entries = await fs.readdir(MOMENTS_ROOT, { withFileTypes: true });
    files = entries
      .filter((entry) => entry.isFile() && YEAR_FILE_PATTERN.test(entry.name))
      .map((entry) => entry.name)
      .sort((a, b) => b.localeCompare(a));
  } catch {
    return [] as MomentItem[];
  }

  const groups = await Promise.all(
    files.map((file) => readMomentsFromFile(path.join(MOMENTS_ROOT, file))),
  );

  const all = groups.flat();
  all.sort(compareMoments);
  return all;
}

export function formatMomentDateTime(dateTime: string) {
  return `${dateTime.slice(0, 10)} ${dateTime.slice(11, 16)}`;
}
