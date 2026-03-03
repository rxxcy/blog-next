"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useMemo, useState } from "react";
import { isValidAlbumSlug } from "@/lib/albums-auth";

const DEFAULT_REDIRECT = "/albums";

function getSafeFrom(from: string | null) {
  if (!from) return DEFAULT_REDIRECT;
  if (!from.startsWith("/albums")) return DEFAULT_REDIRECT;
  return from;
}

function getSlugFromAlbumsPath(input: string | null) {
  if (!input) return "";

  try {
    const pathname = input.startsWith("/")
      ? input.split("?")[0]?.split("#")[0] ?? ""
      : new URL(input).pathname;
    const parts = pathname.split("/").filter(Boolean);
    const slug = parts[0] === "albums" ? parts[1] ?? "" : "";
    return slug && isValidAlbumSlug(slug) ? slug : "";
  } catch {
    return "";
  }
}

function AlbumsUnlockContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = useMemo(
    () => getSafeFrom(searchParams.get("from")),
    [searchParams],
  );
  const slug = useMemo(() => {
    const fromQuery = String(searchParams.get("slug") ?? "").trim();
    if (fromQuery && isValidAlbumSlug(fromQuery)) return fromQuery;
    return getSlugFromAlbumsPath(from);
  }, [from, searchParams]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      if (!slug) {
        setError("无法识别要解锁的图集。");
        return;
      }

      const response = await fetch("/api/albums/unlock", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ slug, password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        setError(data.message ?? "验证失败，请重试。");
        return;
      }

      router.replace(from);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-sm space-y-4 px-4 md:px-0">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">查看相册</h1>
        <p className="text-sm text-muted-foreground">请输入访问密码后继续。</p>
        {slug ? (
          <p className="text-xs text-muted-foreground/80">图集：{slug}</p>
        ) : null}
      </header>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm text-foreground/80">
          密码
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 block w-full border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-foreground/40"
            placeholder="输入访问密码"
            required
          />
        </label>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="inline-flex h-9 items-center border border-border px-3 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
        >
          {pending ? "验证中..." : "进入相册"}
        </button>
      </form>
    </section>
  );
}

export default function AlbumsUnlockPage() {
  return (
    <Suspense
      fallback={<section className="mx-auto w-full max-w-sm px-4 md:px-0" />}
    >
      <AlbumsUnlockContent />
    </Suspense>
  );
}
