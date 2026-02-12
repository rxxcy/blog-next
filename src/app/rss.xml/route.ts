import { readAllPosts } from "@/lib/posts";

const FALLBACK_SITE_URL = "http://localhost:3000";
const FEED_DESCRIPTION = "Notes feed";
const FEED_TITLE = "Blog Notes";
const FEED_PATH = "/rss.xml";

export const revalidate = 3600;

function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    FALLBACK_SITE_URL;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function toRfc2822Date(input?: string) {
  if (!input) return new Date().toUTCString();
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(input)
    ? `${input}T00:00:00Z`
    : input;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return new Date().toUTCString();
  return date.toUTCString();
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const feedUrl = `${siteUrl}${FEED_PATH}`;
  const posts = await readAllPosts({ includeDraft: false });
  const publicPosts = posts.filter((post) => !post.requiresPassword);

  const items = publicPosts
    .map((post) => {
      const title = escapeXml(post.title);
      const description = escapeXml(post.summary);
      const link = `${siteUrl}${post.url}`;
      const pubDate = toRfc2822Date(post.updatedAt ?? post.date);
      const guid = escapeXml(link);
      return [
        "<item>",
        `<title>${title}</title>`,
        `<link>${link}</link>`,
        `<guid isPermaLink="true">${guid}</guid>`,
        `<pubDate>${pubDate}</pubDate>`,
        `<description>${description}</description>`,
        "</item>",
      ].join("");
    })
    .join("");

  const latest = publicPosts[0];
  const lastBuildDate = toRfc2822Date(latest?.updatedAt ?? latest?.date);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${feedUrl}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
