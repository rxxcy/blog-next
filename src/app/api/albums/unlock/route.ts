import { NextResponse } from "next/server";
import {
  ALBUMS_AUTH_COOKIE,
  ALBUMS_COOKIE_MAX_AGE,
  ALBUMS_PASSWORD_ENV,
} from "@/lib/albums-auth";

type UnlockBody = {
  password?: string;
};

export async function POST(request: Request) {
  const configuredPassword = process.env[ALBUMS_PASSWORD_ENV];
  if (!configuredPassword) {
    return NextResponse.json(
      { message: "服务端未配置相册访问密码。" },
      { status: 503 },
    );
  }

  let body: UnlockBody;
  try {
    body = (await request.json()) as UnlockBody;
  } catch {
    return NextResponse.json({ message: "请求格式错误。" }, { status: 400 });
  }

  if (!body.password || body.password !== configuredPassword) {
    return NextResponse.json({ message: "密码不正确。" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ALBUMS_AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ALBUMS_COOKIE_MAX_AGE,
  });
  return response;
}
