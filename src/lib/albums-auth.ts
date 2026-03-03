export const ALBUMS_AUTH_COOKIE = "albums_unlocked";
export const ALBUMS_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const ALBUMS_PASSWORD_ENV = "ALBUM_ACCESS_PASSWORD";

const ALBUM_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type AlbumProtectionMeta = {
  requiresPassword?: boolean;
  password?: string | null;
};

export function isValidAlbumSlug(slug: string) {
  return ALBUM_SLUG_PATTERN.test(slug);
}

export function hasAlbumPassword(password: string | null | undefined) {
  return typeof password === "string" && password.trim().length > 0;
}

export function isAlbumProtected(meta: AlbumProtectionMeta | null | undefined) {
  return Boolean(meta?.requiresPassword) || hasAlbumPassword(meta?.password);
}

export function parseUnlockedAlbumsCookie(
  value: string | null | undefined,
): Set<string> {
  if (!value) return new Set();

  let normalized = value;
  try {
    normalized = decodeURIComponent(value);
  } catch {
    normalized = value;
  }

  const slugs = normalized
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && isValidAlbumSlug(part));

  return new Set(slugs);
}

export function serializeUnlockedAlbumsCookie(slugs: Iterable<string>) {
  const unique = new Set<string>();
  for (const slug of slugs) {
    if (isValidAlbumSlug(slug)) unique.add(slug);
  }
  return Array.from(unique).sort().join(",");
}
