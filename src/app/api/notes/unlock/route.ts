import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readPostBySlug } from "@/lib/posts";
import {
  getPostAccessKey,
  isPostProtected,
  isValidPostSlug,
  isValidPostYear,
  POSTS_AUTH_COOKIE,
  POSTS_COOKIE_MAX_AGE,
  parseUnlockedPostsCookie,
  serializeUnlockedPostsCookie,
} from "@/lib/posts-auth";

type UnlockBody = {
  year?: string;
  slug?: string;
  password?: string;
};

export async function POST(request: NextRequest) {
  let body: UnlockBody;
  try {
    body = (await request.json()) as UnlockBody;
  } catch {
    return NextResponse.json({ message: "请求格式错误。" }, { status: 400 });
  }

  const year = String(body.year ?? "").trim();
  const slug = String(body.slug ?? "").trim();
  if (!isValidPostYear(year) || !isValidPostSlug(slug)) {
    return NextResponse.json({ message: "文章标识不合法。" }, { status: 400 });
  }

  const post = await readPostBySlug(year, slug, {
    includeDraft: process.env.NODE_ENV !== "production",
  });
  if (!post) {
    return NextResponse.json({ message: "文章不存在。" }, { status: 404 });
  }

  if (!isPostProtected(post)) {
    return NextResponse.json({ ok: true });
  }

  const configuredPassword =
    typeof post.password === "string" ? post.password.trim() : "";
  if (!configuredPassword) {
    return NextResponse.json(
      { message: "该文章已标记为受保护，但未配置密码。" },
      { status: 503 },
    );
  }

  const inputPassword = String(body.password ?? "").trim();
  if (!inputPassword || inputPassword !== configuredPassword) {
    return NextResponse.json({ message: "密码不正确。" }, { status: 401 });
  }

  const postAccessKey = getPostAccessKey(year, slug);
  if (!postAccessKey) {
    return NextResponse.json({ message: "文章标识不合法。" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  const unlockedPosts = parseUnlockedPostsCookie(
    request.cookies.get(POSTS_AUTH_COOKIE)?.value,
  );
  unlockedPosts.add(postAccessKey);

  response.cookies.set(
    POSTS_AUTH_COOKIE,
    serializeUnlockedPostsCookie(unlockedPosts),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: POSTS_COOKIE_MAX_AGE,
    },
  );
  return response;
}
