import { notFound, redirect } from "next/navigation";
import { NotesUnlockForm } from "@/components/notes-unlock-form";
import { readPostBySlug } from "@/lib/posts";
import { isValidPostSlug, isValidPostYear } from "@/lib/posts-auth";

type NotesUnlockPageProps = {
  searchParams: Promise<{
    from?: string;
    year?: string;
    slug?: string;
  }>;
};

function buildDefaultRedirect(year: string, slug: string) {
  return `/notes/${year}/${slug}`;
}

function getSafeFrom(from: string | undefined, year: string, slug: string) {
  const fallback = buildDefaultRedirect(year, slug);
  if (!from) return fallback;
  if (!from.startsWith("/notes/")) return fallback;
  if (from.startsWith("/notes/unlock")) return fallback;
  return from;
}

export default async function NotesUnlockPage({
  searchParams,
}: NotesUnlockPageProps) {
  const { from, year = "", slug = "" } = await searchParams;
  if (!isValidPostYear(year) || !isValidPostSlug(slug)) {
    notFound();
  }

  const post = await readPostBySlug(year, slug, {
    includeDraft: process.env.NODE_ENV !== "production",
  });
  if (!post) {
    notFound();
  }

  if (!post.requiresPassword) {
    redirect(buildDefaultRedirect(year, slug));
  }

  return (
    <NotesUnlockForm
      from={getSafeFrom(from, year, slug)}
      year={year}
      slug={slug}
      title={post.title}
      passwordHint={post.passwordHint}
    />
  );
}
