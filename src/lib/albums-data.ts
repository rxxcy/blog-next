import fs from "node:fs/promises";
import path from "node:path";

type AlbumMeta = {
  slug?: string;
  title?: string;
  description?: string;
  date?: string | null;
  requiresPassword?: boolean;
  passwordHint?: string;
};

type AlbumManifestImage = {
  id: string;
  filename: string;
  width?: number | null;
  height?: number | null;
  webp: string;
  thumb: string;
};

type AlbumManifest = {
  slug: string;
  title: string;
  description?: string;
  date?: string | null;
  cover?: {
    webp?: string;
    jpg?: string;
    width?: number;
    height?: number;
  };
  images?: AlbumManifestImage[];
};

export type AlbumListItem = {
  slug: string;
  title: string;
  description: string;
  date: string | null;
  coverSrc: string;
  imageCount: number;
  requiresPassword: boolean;
};

export type AlbumDetail = AlbumListItem & {
  images: AlbumManifestImage[];
  passwordHint?: string;
};

const PUBLIC_ALBUMS_ROOT = path.join(process.cwd(), "public", "albums");
const CONTENT_ALBUMS_ROOT = path.join(process.cwd(), "content", "albums");

async function readJson<T>(targetPath: string): Promise<T> {
  const raw = await fs.readFile(targetPath, "utf8");
  return JSON.parse(raw) as T;
}

async function readAlbumMeta(
  folder: string,
  slugFromManifest: string,
): Promise<AlbumMeta> {
  const folderMetaPath = path.join(CONTENT_ALBUMS_ROOT, folder, "album.json");
  try {
    return await readJson<AlbumMeta>(folderMetaPath);
  } catch {
    if (slugFromManifest !== folder) {
      const slugMetaPath = path.join(
        CONTENT_ALBUMS_ROOT,
        slugFromManifest,
        "album.json",
      );
      try {
        return await readJson<AlbumMeta>(slugMetaPath);
      } catch {
        return {};
      }
    }
    return {};
  }
}

export function formatAlbumDate(date: string | null) {
  if (!date) return "未设置日期";

  const formatted = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(formatted.getTime())) return date;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(formatted);
}

function compareAlbums(a: AlbumListItem, b: AlbumListItem) {
  if (a.date && b.date && a.date !== b.date) {
    return b.date.localeCompare(a.date);
  }
  if (a.date && !b.date) return -1;
  if (!a.date && b.date) return 1;
  return a.title.localeCompare(b.title, "zh-CN");
}

export async function readAlbumsList() {
  let folders: string[] = [];
  try {
    const entries = await fs.readdir(PUBLIC_ALBUMS_ROOT, {
      withFileTypes: true,
    });
    folders = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return { albums: [] as AlbumListItem[], unreadableCount: 0 };
  }

  const albums: AlbumListItem[] = [];
  let unreadableCount = 0;

  for (const folder of folders) {
    const manifestPath = path.join(PUBLIC_ALBUMS_ROOT, folder, "manifest.json");
    try {
      const manifest = await readJson<AlbumManifest>(manifestPath);
      const slug = manifest.slug || folder;
      const meta = await readAlbumMeta(folder, slug);

      albums.push({
        slug,
        title: manifest.title || slug,
        description: manifest.description || "暂无描述",
        date: manifest.date ?? null,
        coverSrc:
          manifest.cover?.webp ||
          manifest.cover?.jpg ||
          `/albums/${slug}/cover/cover.jpg`,
        imageCount: manifest.images?.length ?? 0,
        requiresPassword: Boolean(meta.requiresPassword),
      });
    } catch {
      unreadableCount += 1;
    }
  }

  albums.sort(compareAlbums);
  return { albums, unreadableCount };
}

export async function readAlbumDetail(
  slug: string,
): Promise<AlbumDetail | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  const manifestPath = path.join(PUBLIC_ALBUMS_ROOT, slug, "manifest.json");

  let manifest: AlbumManifest;
  try {
    manifest = await readJson<AlbumManifest>(manifestPath);
  } catch {
    return null;
  }

  const meta = await readAlbumMeta(slug, manifest.slug || slug);
  const normalizedSlug = manifest.slug || slug;

  return {
    slug: normalizedSlug,
    title: manifest.title || normalizedSlug,
    description: manifest.description || "暂无描述",
    date: manifest.date ?? null,
    coverSrc:
      manifest.cover?.webp ||
      manifest.cover?.jpg ||
      `/albums/${normalizedSlug}/cover/cover.jpg`,
    imageCount: manifest.images?.length ?? 0,
    requiresPassword: Boolean(meta.requiresPassword),
    passwordHint: meta.passwordHint,
    images: manifest.images ?? [],
  };
}
