"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type NotesUnlockFormProps = {
  from: string;
  year: string;
  slug: string;
  title: string;
  passwordHint?: string;
};

export function NotesUnlockForm({
  from,
  year,
  slug,
  title,
  passwordHint,
}: NotesUnlockFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/notes/unlock", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ year, slug, password }),
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
        <h1 className="text-xl font-semibold tracking-tight">查看笔记</h1>
        <p className="text-sm text-muted-foreground">请输入访问密码后继续。</p>
        <p className="text-xs text-muted-foreground/80">文章：{title}</p>
        {passwordHint ? (
          <p className="text-xs text-muted-foreground/80">
            密码提示：{passwordHint}
          </p>
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
          {pending ? "验证中..." : "进入笔记"}
        </button>
      </form>
    </section>
  );
}
