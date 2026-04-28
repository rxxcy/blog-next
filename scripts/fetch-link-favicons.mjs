#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_DATA_FILE = path.join("content", "links", "links.json");
const DEFAULT_OUTPUT_DIR = path.join("public", "image", "links");
const FETCH_TIMEOUT_MS = 12_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; blog-links-favicon-fetcher/1.0; +https://example.invalid)";
const WELL_KNOWN_ICON_PATHS = [
  "/favicon.ico",
  "/favicon.svg",
  "/favicon.png",
  "/apple-touch-icon.png",
];
const FALLBACK_ICON_SERVICES = [
  (hostname) => `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
  (hostname) => `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
];
const IMAGE_EXTS = new Set([".ico", ".png", ".svg", ".jpg", ".jpeg", ".webp"]);

const HELP_TEXT = `
Usage:
  pnpm links:favicons
  pnpm links:favicons -- --file content/links/links.json
  node scripts/fetch-link-favicons.mjs --force

What it does:
  1) Read links data from content/links/links.json by default
  2) Find link items where icon is missing or blank
  3) Fetch favicon from the target website
  4) Save favicon into public/image/links/
  5) Write the local icon path back into links.json

Supported root formats:
  - [{ category, description?, items: [...] }]
  - { groups: [{ category, description?, items: [...] }] }

Options:
  --file <path>      Custom links data file path
  --out-dir <path>   Custom favicon output directory under public/
  --force            Re-fetch icons even when item.icon already exists
  --dry-run          Show what would change without writing files
  -h, --help         Show this help
`;

function parseArgs(argv) {
  const options = {
    file: DEFAULT_DATA_FILE,
    outDir: DEFAULT_OUTPUT_DIR,
    force: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--file") {
      options.file = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (arg === "--out-dir") {
      options.outDir = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.file.trim()) {
    throw new Error("Missing value for --file");
  }
  if (!options.outDir.trim()) {
    throw new Error("Missing value for --out-dir");
  }

  return options;
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isMissingIcon(value) {
  return !isNonEmptyString(value);
}

function isConcreteIconSource(value) {
  if (!isNonEmptyString(value)) return false;
  return value.startsWith("/") || /^https?:\/\//i.test(value);
}

function sanitizeDomainKey(hostname) {
  return hostname
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getPathExtension(rawPath) {
  const ext = path.extname(rawPath).toLowerCase();
  return IMAGE_EXTS.has(ext) ? ext : "";
}

function extensionFromContentType(contentType) {
  const normalized = String(contentType || "")
    .toLowerCase()
    .split(";")[0]
    .trim();
  if (normalized === "image/png") return ".png";
  if (normalized === "image/svg+xml") return ".svg";
  if (normalized === "image/jpeg") return ".jpg";
  if (normalized === "image/webp") return ".webp";
  if (
    normalized === "image/x-icon" ||
    normalized === "image/vnd.microsoft.icon"
  ) {
    return ".ico";
  }
  return "";
}

function getPublicPath(rootDir, filePath) {
  const publicDir = path.join(rootDir, "public");
  const relative = path.relative(publicDir, filePath);
  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    relative.length === 0
  ) {
    throw new Error("Output directory must stay inside public/");
  }
  return `/${relative.split(path.sep).join("/")}`;
}

function collectGroups(data) {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object" && Array.isArray(data.groups)) {
    return data.groups;
  }
  throw new Error(
    "Unsupported links data format. Expected an array or an object with groups[].",
  );
}

function collectLinkTargets(groups) {
  const targets = [];
  for (const group of groups) {
    if (!group || typeof group !== "object" || !Array.isArray(group.items)) {
      continue;
    }
    for (const item of group.items) {
      if (!item || typeof item !== "object") {
        continue;
      }
      targets.push(item);
    }
  }
  return targets;
}

function getAttrValue(tag, attrName) {
  const escaped = attrName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const quoted = new RegExp(`${escaped}\\s*=\\s*(['"])(.*?)\\1`, "i");
  const quotedMatch = tag.match(quoted);
  if (quotedMatch?.[2]) {
    return quotedMatch[2].trim();
  }

  const bare = new RegExp(`${escaped}\\s*=\\s*([^\\s>]+)`, "i");
  const bareMatch = tag.match(bare);
  if (bareMatch?.[1]) {
    return bareMatch[1].trim();
  }

  return "";
}

function parseSizeScore(sizes) {
  if (!isNonEmptyString(sizes)) return 0;
  if (sizes.toLowerCase() === "any") return 4096;

  let max = 0;
  for (const token of sizes.split(/\s+/)) {
    const match = token.match(/^(\d+)x(\d+)$/i);
    if (!match) continue;
    const size = Number(match[1]) * Number(match[2]);
    if (size > max) max = size;
  }
  return max;
}

function relScore(rel) {
  const normalized = rel.toLowerCase();
  if (normalized.includes("shortcut icon")) return 30;
  if (normalized.split(/\s+/).includes("icon")) return 20;
  if (normalized.includes("apple-touch-icon")) return 10;
  return 0;
}

function extScore(iconUrl) {
  const ext = getPathExtension(new URL(iconUrl).pathname);
  if (ext === ".svg") return 4;
  if (ext === ".png") return 3;
  if (ext === ".webp") return 2;
  if (ext === ".jpg" || ext === ".jpeg") return 1;
  if (ext === ".ico") return 0;
  return -1;
}

function uniqueValues(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function extractIconCandidates(html, pageUrl) {
  const baseTagMatch = html.match(/<base\b[^>]*>/i);
  const baseHref = baseTagMatch ? getAttrValue(baseTagMatch[0], "href") : "";
  const baseUrl = isNonEmptyString(baseHref)
    ? new URL(baseHref, pageUrl).toString()
    : pageUrl;

  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  const candidates = [];

  for (let index = 0; index < tags.length; index++) {
    const tag = tags[index];
    const rel = getAttrValue(tag, "rel");
    const href = getAttrValue(tag, "href");
    if (!isNonEmptyString(rel) || !isNonEmptyString(href)) {
      continue;
    }
    if (!/\b(icon|apple-touch-icon)\b/i.test(rel)) {
      continue;
    }
    if (href.startsWith("data:")) {
      continue;
    }

    const iconUrl = new URL(href, baseUrl).toString();
    candidates.push({
      url: iconUrl,
      order: index,
      score:
        relScore(rel) * 10_000 +
        parseSizeScore(getAttrValue(tag, "sizes")) * 10 +
        extScore(iconUrl),
    });
  }

  candidates.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return a.order - b.order;
  });

  return uniqueValues(candidates.map((candidate) => candidate.url));
}

async function fetchWithTimeout(url, init = {}) {
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
}

async function downloadIconFile({ iconUrl, domainKey, outputDir, rootDir }) {
  const response = await fetchWithTimeout(iconUrl, {
    headers: {
      Accept: "image/*,*/*;q=0.8",
      "User-Agent": USER_AGENT,
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const ext =
    extensionFromContentType(contentType) ||
    getPathExtension(new URL(response.url).pathname) ||
    getPathExtension(new URL(iconUrl).pathname) ||
    ".ico";

  const maybeHtml = contentType.toLowerCase().includes("text/html");
  if (maybeHtml) {
    throw new Error("Received HTML instead of favicon image");
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0) {
    throw new Error("Empty favicon response");
  }

  const outputPath = path.join(outputDir, `${domainKey}${ext}`);
  await fs.writeFile(outputPath, bytes);
  return getPublicPath(rootDir, outputPath);
}

async function resolveFavicon({ siteUrl, domainKey, outputDir, rootDir }) {
  const parsedSiteUrl = new URL(siteUrl);
  const pageUrl = parsedSiteUrl.toString();
  const hostname = parsedSiteUrl.hostname;
  const pageCandidates = [];

  try {
    const pageResponse = await fetchWithTimeout(pageUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
        "User-Agent": USER_AGENT,
      },
      redirect: "follow",
    });

    if (pageResponse.ok) {
      const contentType = pageResponse.headers.get("content-type") ?? "";
      if (contentType.toLowerCase().includes("text/html")) {
        const html = await pageResponse.text();
        pageCandidates.push(...extractIconCandidates(html, pageResponse.url));
      } else {
        pageCandidates.push(pageResponse.url);
      }

      for (const fallbackPath of WELL_KNOWN_ICON_PATHS) {
        pageCandidates.push(new URL(fallbackPath, pageResponse.url).toString());
      }
    }
  } catch {
    for (const fallbackPath of WELL_KNOWN_ICON_PATHS) {
      pageCandidates.push(new URL(fallbackPath, pageUrl).toString());
    }
  }

  for (const buildServiceUrl of FALLBACK_ICON_SERVICES) {
    pageCandidates.push(buildServiceUrl(hostname));
  }

  for (const candidateUrl of uniqueValues(pageCandidates)) {
    try {
      return await downloadIconFile({
        iconUrl: candidateUrl,
        domainKey,
        outputDir,
        rootDir,
      });
    } catch {
      // Try the next candidate URL.
    }
  }

  return null;
}

async function buildExistingIconMap(rootDir, outputDir) {
  const map = new Map();
  if (!(await exists(outputDir))) {
    return map;
  }

  const entries = await fs.readdir(outputDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = getPathExtension(entry.name);
    if (!ext) continue;
    const key = path.parse(entry.name).name;
    if (map.has(key)) continue;
    map.set(key, getPublicPath(rootDir, path.join(outputDir, entry.name)));
  }

  return map;
}

function buildSeedDomainMap(items) {
  const map = new Map();
  for (const item of items) {
    if (!isNonEmptyString(item?.url) || !isConcreteIconSource(item?.icon)) {
      continue;
    }
    try {
      const hostname = new URL(item.url).hostname;
      const domainKey = sanitizeDomainKey(hostname);
      if (!map.has(domainKey)) {
        map.set(domainKey, item.icon);
      }
    } catch {
      // Ignore invalid URLs in seed data.
    }
  }
  return map;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(HELP_TEXT.trim());
    return;
  }

  const rootDir = process.cwd();
  const dataFilePath = path.resolve(rootDir, options.file);
  const outputDir = path.resolve(rootDir, options.outDir);

  if (!(await exists(dataFilePath))) {
    throw new Error(`Links data file not found: ${options.file}`);
  }

  getPublicPath(rootDir, path.join(outputDir, "placeholder.ico"));

  if (!options.dryRun) {
    await ensureDir(outputDir);
  }

  const data = await readJson(dataFilePath);
  const groups = collectGroups(data);
  const items = collectLinkTargets(groups);
  const existingIconMap = await buildExistingIconMap(rootDir, outputDir);
  const domainIconMap = buildSeedDomainMap(items);

  const stats = {
    total: items.length,
    skipped: 0,
    reused: 0,
    downloaded: 0,
    failed: 0,
    updated: 0,
  };

  let mutated = false;

  for (const item of items) {
    const currentUrl = String(item.url ?? "").trim();
    const currentIcon = String(item.icon ?? "").trim();
    const needsFetch = options.force || isMissingIcon(currentIcon);

    if (!needsFetch) {
      stats.skipped += 1;
      continue;
    }

    if (!isNonEmptyString(currentUrl)) {
      console.warn(`- 跳过 ${item.title ?? "(untitled)"}: 缺少 url`);
      stats.failed += 1;
      continue;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(currentUrl);
    } catch {
      console.warn(`- 跳过 ${item.title ?? currentUrl}: url 非法`);
      stats.failed += 1;
      continue;
    }

    const domainKey = sanitizeDomainKey(parsedUrl.hostname);

    if (!options.force) {
      const reusedIcon =
        domainIconMap.get(domainKey) ?? existingIconMap.get(domainKey) ?? null;
      if (reusedIcon) {
        item.icon = reusedIcon;
        domainIconMap.set(domainKey, reusedIcon);
        stats.reused += 1;
        stats.updated += 1;
        mutated = true;
        console.log(`- 复用 ${parsedUrl.hostname} -> ${reusedIcon}`);
        continue;
      }
    }

    if (options.dryRun) {
      console.log(`- 将抓取 ${parsedUrl.hostname}`);
      continue;
    }

    const resolvedIcon = await resolveFavicon({
      siteUrl: currentUrl,
      domainKey,
      outputDir,
      rootDir,
    });

    if (!resolvedIcon) {
      console.warn(`- 获取失败 ${parsedUrl.hostname}`);
      stats.failed += 1;
      continue;
    }

    item.icon = resolvedIcon;
    domainIconMap.set(domainKey, resolvedIcon);
    existingIconMap.set(domainKey, resolvedIcon);
    stats.downloaded += 1;
    stats.updated += 1;
    mutated = true;
    console.log(`- 抓取成功 ${parsedUrl.hostname} -> ${resolvedIcon}`);
  }

  if (mutated && !options.dryRun) {
    await fs.writeFile(
      dataFilePath,
      `${JSON.stringify(data, null, 2)}\n`,
      "utf8",
    );
  }

  console.log("");
  console.log("完成：");
  console.log(`- items: ${stats.total}`);
  console.log(`- updated: ${stats.updated}`);
  console.log(`- downloaded: ${stats.downloaded}`);
  console.log(`- reused: ${stats.reused}`);
  console.log(`- skipped: ${stats.skipped}`);
  console.log(`- failed: ${stats.failed}`);

  if (stats.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("抓取 favicon 失败：", error);
  process.exitCode = 1;
});
