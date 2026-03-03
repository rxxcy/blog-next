import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ALBUMS_AUTH_COOKIE,
  isValidAlbumSlug,
  parseUnlockedAlbumsCookie,
} from "@/lib/albums-auth";
import { POSTS_AUTH_COOKIE, POSTS_PASSWORD_ENV } from "@/lib/posts-auth";

type AlbumsAccessIndex = {
  albums?: Record<string, { requiresPassword?: boolean }>;
};

function handleProtectedSection(
  request: NextRequest,
  options: {
    sectionBase: "/notes";
    unlockPath: "/notes/unlock";
    cookieName: string;
    envName: string;
  },
) {
  const configuredPassword = process.env[options.envName];
  if (!configuredPassword) {
    return null;
  }

  const { pathname, search } = request.nextUrl;
  if (!pathname.startsWith(options.sectionBase)) {
    return null;
  }

  if (pathname === options.unlockPath) {
    return NextResponse.next();
  }

  const unlocked = request.cookies.get(options.cookieName)?.value === "1";
  if (unlocked) {
    return NextResponse.next();
  }

  const unlockUrl = request.nextUrl.clone();
  unlockUrl.pathname = options.unlockPath;
  unlockUrl.searchParams.set("from", `${pathname}${search}`);
  return NextResponse.redirect(unlockUrl);
}

function getAlbumSlugFromPathname(pathname: string) {
  if (pathname === "/albums" || pathname === "/albums/") return null;
  if (pathname === "/albums/unlock" || pathname.startsWith("/albums/unlock/")) {
    return null;
  }
  if (pathname === "/albums/access-index.json") return null;

  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "albums" || parts.length < 2) return null;

  const slug = parts[1];
  if (!isValidAlbumSlug(slug)) return null;
  return slug;
}

async function readAlbumsAccessIndex(
  request: NextRequest,
): Promise<Record<string, { requiresPassword?: boolean }> | null> {
  const url = new URL("/albums/access-index.json", request.url);

  try {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as AlbumsAccessIndex;
    return data.albums ?? {};
  } catch (error) {
    console.error("[albums-auth] failed to load access-index:", error);
    return null;
  }
}

function redirectToAlbumUnlock(request: NextRequest, slug: string) {
  const unlockUrl = request.nextUrl.clone();
  unlockUrl.pathname = "/albums/unlock";
  unlockUrl.searchParams.set(
    "from",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  unlockUrl.searchParams.set("slug", slug);
  return NextResponse.redirect(unlockUrl);
}

async function handleProtectedAlbumRoutes(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/albums")) return null;

  if (pathname === "/albums" || pathname === "/albums/") {
    return NextResponse.next();
  }

  if (pathname === "/albums/unlock" || pathname.startsWith("/albums/unlock/")) {
    return NextResponse.next();
  }

  if (pathname === "/albums/access-index.json") {
    return NextResponse.next();
  }

  const slug = getAlbumSlugFromPathname(pathname);
  if (!slug) {
    return NextResponse.next();
  }

  const accessIndex = await readAlbumsAccessIndex(request);
  if (!accessIndex) {
    return redirectToAlbumUnlock(request, slug);
  }

  const requiresPassword = Boolean(accessIndex[slug]?.requiresPassword);
  if (!requiresPassword) {
    return NextResponse.next();
  }

  const unlockedAlbums = parseUnlockedAlbumsCookie(
    request.cookies.get(ALBUMS_AUTH_COOKIE)?.value,
  );
  if (unlockedAlbums.has(slug)) {
    return NextResponse.next();
  }

  return redirectToAlbumUnlock(request, slug);
}

export async function middleware(request: NextRequest) {
  const albumsResult = await handleProtectedAlbumRoutes(request);
  if (albumsResult) return albumsResult;

  const notesResult = handleProtectedSection(request, {
    sectionBase: "/notes",
    unlockPath: "/notes/unlock",
    cookieName: POSTS_AUTH_COOKIE,
    envName: POSTS_PASSWORD_ENV,
  });
  if (notesResult) return notesResult;

  return NextResponse.next();
}

export const config = {
  matcher: ["/albums/:path*", "/notes/:path*"],
};
