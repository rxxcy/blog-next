import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx-components";

type PostFrontmatter = {
  title?: string;
  date?: string;
  summary?: string;
  tags?: string[] | string;
  draft?: boolean;
  cover?: string;
  updatedAt?: string;
  requiresPassword?: boolean;
  passwordHint?: string;
};

export type PostMeta = {
  year: string;
  slug: string;
  pathSegments: [string, string];
  url: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  draft: boolean;
  cover?: string;
  updatedAt?: string;
  requiresPassword: boolean;
  passwordHint?: string;
  wordCount: number;
};

export type Post = PostMeta & {
  body: string;
};

const POSTS_ROOT = path.join(process.cwd(), "content", "posts");

function normalizeTags(tags: PostFrontmatter["tags"]): string[] {
  if (!tags) return [];
  if (Array.isArray(tags))
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  return String(tags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function countWords(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function comparePosts(a: PostMeta, b: PostMeta) {
  if (a.date !== b.date) return b.date.localeCompare(a.date);
  return a.title.localeCompare(b.title, "zh-CN");
}

async function readPostFromFile(
  year: string,
  filename: string,
): Promise<Post | null> {
  if (!filename.endsWith(".mdx")) return null;
  const slug = filename.replace(/\.mdx$/, "");
  const fullPath = path.join(POSTS_ROOT, year, filename);
  const raw = await fs.readFile(fullPath, "utf8");
  const parsed = matter(raw);
  const fm = parsed.data as PostFrontmatter;

  const title = (fm.title || slug).trim();
  const date = fm.date || `${year}-01-01`;
  const summary = (fm.summary || "暂无摘要").trim();
  const tags = normalizeTags(fm.tags);
  const draft = Boolean(fm.draft);
  const body = parsed.content.trim();

  return {
    year,
    slug,
    pathSegments: [year, slug],
    url: `/notes/${year}/${slug}`,
    title,
    date,
    summary,
    tags,
    draft,
    cover: fm.cover,
    updatedAt: fm.updatedAt,
    requiresPassword: Boolean(fm.requiresPassword),
    passwordHint: fm.passwordHint,
    wordCount: countWords(body),
    body,
  };
}

export async function readAllPosts(options?: { includeDraft?: boolean }) {
  const includeDraft = Boolean(options?.includeDraft);
  let yearDirs: string[] = [];
  try {
    const dirEntries = await fs.readdir(POSTS_ROOT, { withFileTypes: true });
    yearDirs = dirEntries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => b.localeCompare(a));
  } catch {
    return [] as Post[];
  }

  const posts: Post[] = [];
  for (const year of yearDirs) {
    const yearPath = path.join(POSTS_ROOT, year);
    const files = await fs.readdir(yearPath);
    for (const file of files) {
      const post = await readPostFromFile(year, file);
      if (!post) continue;
      if (!includeDraft && post.draft) continue;
      posts.push(post);
    }
  }

  posts.sort(comparePosts);
  return posts;
}

export async function readPostBySlug(
  year: string,
  slug: string,
  options?: { includeDraft?: boolean },
) {
  if (!/^\d{4}$/.test(year)) return null;
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  try {
    const post = await readPostFromFile(year, `${slug}.mdx`);
    if (!post) return null;
    if (!options?.includeDraft && post.draft) return null;
    return post;
  } catch {
    return null;
  }
}

export async function getPostStaticParams() {
  const posts = await readAllPosts({ includeDraft: false });
  return posts.map((post) => ({ year: post.year, slug: post.slug }));
}

export async function renderPostMdx(source: string) {
  const compiled = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
          [
            rehypePrettyCode,
            {
              theme: {
                dark: "vitesse-dark",
                light: "github-light",
              },
              keepBackground: false,
            },
          ],
        ],
      },
    },
  });

  return compiled.content;
}

export function formatPostDate(date: string) {
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatWordCount(count: number) {
  return `${count.toLocaleString("en-US")} 字`;
}
