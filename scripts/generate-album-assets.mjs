#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const SUPPORTED_EXTS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".bmp",
  ".tif",
  ".tiff",
]);

const THUMB_WIDTH = Number(process.env.ALBUM_THUMB_WIDTH ?? 480);
const WEBP_WIDTH = Number(process.env.ALBUM_WEBP_WIDTH ?? 1600);
const THUMB_QUALITY = Number(process.env.ALBUM_THUMB_QUALITY ?? 72);
const WEBP_QUALITY = Number(process.env.ALBUM_WEBP_QUALITY ?? 82);
const COVER_WIDTH = Number(process.env.ALBUM_COVER_WIDTH ?? 1200);
const COVER_HEIGHT = Number(process.env.ALBUM_COVER_HEIGHT ?? 800);
const COVER_WEBP_QUALITY = Number(process.env.ALBUM_COVER_WEBP_QUALITY ?? 84);
const COVER_JPEG_QUALITY = Number(process.env.ALBUM_COVER_JPEG_QUALITY ?? 86);

function isImageFile(filename) {
  return SUPPORTED_EXTS.has(path.extname(filename).toLowerCase());
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function collectAlbumFolders(albumsRoot) {
  const entries = await fs.readdir(albumsRoot, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function processAlbum({ sharp, albumsRoot, publicRoot, folderName }) {
  const albumRoot = path.join(albumsRoot, folderName);
  const albumJsonPath = path.join(albumRoot, "album.json");
  const originalDir = path.join(albumRoot, "original");

  if (!(await exists(albumJsonPath))) {
    console.log(`- 跳过 ${folderName}: 缺少 album.json`);
    return null;
  }

  if (!(await exists(originalDir))) {
    console.log(`- 跳过 ${folderName}: 缺少 original/`);
    return null;
  }

  const albumMeta = await readJson(albumJsonPath);
  const slug = String(albumMeta.slug || folderName);
  const files = (await fs.readdir(originalDir)).filter(isImageFile).sort();

  if (files.length === 0) {
    console.log(`- 跳过 ${folderName}: original/ 下没有可处理图片`);
    return null;
  }

  const outputRoot = path.join(publicRoot, slug);
  const coverDir = path.join(outputRoot, "cover");
  const thumbsDir = path.join(outputRoot, "thumbs");
  const webpDir = path.join(outputRoot, "webp");
  await Promise.all([ensureDir(coverDir), ensureDir(thumbsDir), ensureDir(webpDir)]);

  const items = [];
  for (const file of files) {
    const inputPath = path.join(originalDir, file);
    const stem = path.parse(file).name;
    const thumbOut = path.join(thumbsDir, `${stem}.webp`);
    const webpOut = path.join(webpDir, `${stem}.webp`);

    await sharp(inputPath)
      .rotate()
      .resize({ width: WEBP_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpOut);

    await sharp(inputPath)
      .rotate()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toFile(thumbOut);

    const metadata = await sharp(inputPath).metadata();
    items.push({
      id: stem,
      filename: file,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      webp: `/albums/${slug}/webp/${stem}.webp`,
      thumb: `/albums/${slug}/thumbs/${stem}.webp`,
    });
  }

  const coverName = files.includes(albumMeta.cover) ? albumMeta.cover : files[0];
  const coverInput = path.join(originalDir, coverName);
  const coverWebp = path.join(coverDir, "cover.webp");
  const coverJpg = path.join(coverDir, "cover.jpg");

  await sharp(coverInput)
    .rotate()
    .resize({ width: COVER_WIDTH, height: COVER_HEIGHT, fit: "cover", position: "attention" })
    .webp({ quality: COVER_WEBP_QUALITY })
    .toFile(coverWebp);

  await sharp(coverInput)
    .rotate()
    .resize({ width: COVER_WIDTH, height: COVER_HEIGHT, fit: "cover", position: "attention" })
    .jpeg({ quality: COVER_JPEG_QUALITY, progressive: true })
    .toFile(coverJpg);

  const manifest = {
    slug,
    title: albumMeta.title ?? slug,
    description: albumMeta.description ?? "",
    date: albumMeta.date ?? null,
    cover: {
      source: coverName,
      webp: `/albums/${slug}/cover/cover.webp`,
      jpg: `/albums/${slug}/cover/cover.jpg`,
      width: COVER_WIDTH,
      height: COVER_HEIGHT,
    },
    images: items,
  };

  await fs.writeFile(
    path.join(outputRoot, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  return { slug, count: items.length };
}

async function main() {
  let sharp;
  try {
    ({ default: sharp } = await import("sharp"));
  } catch {
    console.error(
      "缺少 sharp 依赖。请先执行: pnpm add -D sharp",
    );
    process.exitCode = 1;
    return;
  }

  const root = process.cwd();
  const albumsRoot = path.join(root, "content", "albums");
  const publicRoot = path.join(root, "public", "albums");
  const targetSlug = process.argv[2];

  if (!(await exists(albumsRoot))) {
    console.error("未找到 content/albums 目录。");
    process.exitCode = 1;
    return;
  }

  const folders = await collectAlbumFolders(albumsRoot);
  const targetFolders = targetSlug
    ? folders.filter((name) => name === targetSlug)
    : folders;

  if (targetFolders.length === 0) {
    console.error(
      targetSlug
        ? `未找到图集: ${targetSlug}`
        : "未找到可处理的图集目录。",
    );
    process.exitCode = 1;
    return;
  }

  await ensureDir(publicRoot);

  const results = [];
  for (const folderName of targetFolders) {
    const result = await processAlbum({
      sharp,
      albumsRoot,
      publicRoot,
      folderName,
    });
    if (result) results.push(result);
  }

  if (results.length === 0) {
    console.log("没有生成任何文件。");
    return;
  }

  console.log("生成完成：");
  for (const result of results) {
    console.log(`- ${result.slug}: ${result.count} 张`);
  }
}

main().catch((error) => {
  console.error("生成失败：", error);
  process.exitCode = 1;
});

