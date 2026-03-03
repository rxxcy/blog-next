import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  ALBUMS_AUTH_COOKIE,
  ALBUMS_COOKIE_MAX_AGE,
  isAlbumProtected,
  isValidAlbumSlug,
  parseUnlockedAlbumsCookie,
  serializeUnlockedAlbumsCookie,
} from "@/lib/albums-auth";

type UnlockBody = {
  slug?: string;
  password?: string;
};

type AlbumMeta = {
  slug?: string;
  requiresPassword?: boolean;
  password?: string;
};

async function readAlbumMetaFile(filePath: string): Promise<AlbumMeta | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as AlbumMeta;
  } catch {
    return null;
  }
}

async function readAlbumMeta(slug: string): Promise<AlbumMeta | null> {
  const albumsRoot = path.join(process.cwd(), "content", "albums");
  const directMeta = await readAlbumMetaFile(
    path.join(albumsRoot, slug, "album.json"),
  );
  if (directMeta) return directMeta;

  try {
    const entries = await fs.readdir(albumsRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const meta = await readAlbumMetaFile(
        path.join(albumsRoot, entry.name, "album.json"),
      );
      if (!meta) continue;
      const normalizedSlug = String(meta.slug || entry.name);
      if (normalizedSlug === slug) return meta;
    }
  } catch {
    return null;
  }

  return null;
}

function getCookieValueFromHeader(
  cookieHeader: string | null,
  name: string,
): string | null {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  if (!match?.[1]) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export async function POST(request: Request) {
  let body: UnlockBody;
  try {
    body = (await request.json()) as UnlockBody;
  } catch {
    return NextResponse.json({ message: "请求格式错误。" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim();
  if (!slug || !isValidAlbumSlug(slug)) {
    return NextResponse.json({ message: "图集标识不合法。" }, { status: 400 });
  }

  const meta = await readAlbumMeta(slug);
  if (!meta) {
    return NextResponse.json({ message: "图集不存在。" }, { status: 404 });
  }

  if (!isAlbumProtected(meta)) {
    return NextResponse.json({ ok: true });
  }

  const configuredPassword = typeof meta.password === "string" ? meta.password : "";
  if (!configuredPassword) {
    return NextResponse.json(
      { message: "该图集已标记为受保护，但未配置密码。" },
      { status: 503 },
    );
  }

  const inputPassword = String(body.password ?? "").trim();
  if (!inputPassword || inputPassword !== configuredPassword) {
    return NextResponse.json({ message: "密码不正确。" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const unlockedAlbums = parseUnlockedAlbumsCookie(
    getCookieValueFromHeader(request.headers.get("cookie"), ALBUMS_AUTH_COOKIE),
  );
  unlockedAlbums.add(slug);

  response.cookies.set(ALBUMS_AUTH_COOKIE, serializeUnlockedAlbumsCookie(unlockedAlbums), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ALBUMS_COOKIE_MAX_AGE,
  });
  return response;
}
