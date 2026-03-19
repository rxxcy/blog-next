export const POSTS_AUTH_COOKIE = "posts_unlocked";
export const POSTS_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const POST_YEAR_PATTERN = /^\d{4}$/;
const POST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const POST_ACCESS_KEY_PATTERN = /^\d{4}:[a-z0-9]+(?:-[a-z0-9]+)*$/;

type PostProtectionMeta = {
  requiresPassword?: boolean;
  password?: string | null;
};

export function isValidPostYear(year: string) {
  return POST_YEAR_PATTERN.test(year);
}

export function isValidPostSlug(slug: string) {
  return POST_SLUG_PATTERN.test(slug);
}

export function hasPostPassword(password: string | null | undefined) {
  return typeof password === "string" && password.trim().length > 0;
}

export function isPostProtected(meta: PostProtectionMeta | null | undefined) {
  return Boolean(meta?.requiresPassword) || hasPostPassword(meta?.password);
}

export function getPostAccessKey(year: string, slug: string) {
  if (!isValidPostYear(year) || !isValidPostSlug(slug)) return null;
  return `${year}:${slug}`;
}

function isValidPostAccessKey(value: string) {
  return POST_ACCESS_KEY_PATTERN.test(value);
}

export function parseUnlockedPostsCookie(
  value: string | null | undefined,
): Set<string> {
  if (!value) return new Set();

  let normalized = value;
  try {
    normalized = decodeURIComponent(value);
  } catch {
    normalized = value;
  }

  const keys = normalized
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && isValidPostAccessKey(part));

  return new Set(keys);
}

export function serializeUnlockedPostsCookie(keys: Iterable<string>) {
  const unique = new Set<string>();
  for (const key of keys) {
    if (isValidPostAccessKey(key)) unique.add(key);
  }
  return Array.from(unique).sort().join(",");
}
