import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { AutoNightReading } from "@/components/auto-night-reading";
import { HistoryBackButton } from "@/components/history-back-button";
import { NotesToc } from "@/components/notes-toc";
import { ReadingProgressDots } from "@/components/reading-progress-dots";
import {
  formatPostDate,
  formatWordCount,
  getPostStaticParams,
  readPostBySlug,
  renderPostMdx,
} from "@/lib/posts";
import {
  getPostAccessKey,
  POSTS_AUTH_COOKIE,
  parseUnlockedPostsCookie,
} from "@/lib/posts-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type NotePageProps = {
  params: Promise<{ year: string; slug: string }>;
};

const readCachedPost = cache(
  async (year: string, slug: string, includeDraft: boolean) =>
    readPostBySlug(year, slug, { includeDraft }),
);

async function isPostUnlocked(year: string, slug: string) {
  const postAccessKey = getPostAccessKey(year, slug);
  if (!postAccessKey) return false;

  const cookieStore = await cookies();
  const unlockedPosts = parseUnlockedPostsCookie(
    cookieStore.get(POSTS_AUTH_COOKIE)?.value,
  );
  return unlockedPosts.has(postAccessKey);
}

export async function generateStaticParams() {
  return getPostStaticParams();
}

export async function generateMetadata({
  params,
}: NotePageProps): Promise<Metadata> {
  const { year, slug } = await params;
  const includeDraft = process.env.NODE_ENV !== "production";
  const post = await readCachedPost(year, slug, includeDraft);
  if (!post) {
    return { title: "文章不存在" };
  }

  if (post.requiresPassword && !(await isPostUnlocked(post.year, post.slug))) {
    return {
      title: "受保护的文章 | 笔记",
      description: "这篇文章需要访问密码。",
    };
  }

  return {
    title: `${post.title} | 笔记`,
    description: post.summary,
  };
}

export default async function NoteDetailPage({ params }: NotePageProps) {
  const { year, slug } = await params;
  const includeDraft = process.env.NODE_ENV !== "production";
  const post = await readCachedPost(year, slug, includeDraft);

  if (!post) {
    notFound();
  }

  if (post.requiresPassword) {
    if (!(await isPostUnlocked(post.year, post.slug))) {
      const searchParams = new URLSearchParams({
        from: post.url,
        year: post.year,
        slug: post.slug,
      });
      redirect(`/notes/unlock?${searchParams.toString()}`);
    }
  }

  const content = await renderPostMdx(post.body);

  return (
    <AutoNightReading>
      <div className="relative">
        <ReadingProgressDots />
        <NotesToc />
        <article className="space-y-6 px-4 md:px-0">
          <header className="space-y-3">
            <HistoryBackButton
              className="inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              fallbackHref="/notes"
            >
              <span>cd ..</span>
            </HistoryBackButton>
            <h1 className="text-2xl font-semibold tracking-tight">
              {post.title}
            </h1>
            <p className="text-sm text-muted-foreground">{post.summary}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              <span aria-hidden="true">•</span>
              <span>{formatWordCount(post.wordCount)}</span>
              {post.tags.length > 0 ? (
                <>
                  <span aria-hidden="true">•</span>
                  <span>{post.tags.map((tag) => `#${tag}`).join(" ")}</span>
                </>
              ) : null}
              {post.requiresPassword ? (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="uppercase tracking-wide">Protected</span>
                </>
              ) : null}
              {post.aiPolished ? (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="text-xs text-muted-foreground">AI 润色</span>
                </>
              ) : null}
            </div>
          </header>

          <section className="mdx-content max-w-none">{content}</section>
        </article>
      </div>
    </AutoNightReading>
  );
}
