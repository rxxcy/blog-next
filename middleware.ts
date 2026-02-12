import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ALBUMS_AUTH_COOKIE, ALBUMS_PASSWORD_ENV } from "@/lib/albums-auth";
import { POSTS_AUTH_COOKIE, POSTS_PASSWORD_ENV } from "@/lib/posts-auth";

function handleProtectedSection(
  request: NextRequest,
  options: {
    sectionBase: "/albums" | "/notes";
    unlockPath: "/albums/unlock" | "/notes/unlock";
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

export function middleware(request: NextRequest) {
  const albumsResult = handleProtectedSection(request, {
    sectionBase: "/albums",
    unlockPath: "/albums/unlock",
    cookieName: ALBUMS_AUTH_COOKIE,
    envName: ALBUMS_PASSWORD_ENV,
  });
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
