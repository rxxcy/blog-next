#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";

const HELP_TEXT = `
Usage:
  pnpm album:new
  node scripts/new-album.mjs

What it does:
  1) Ask questions interactively
  2) Create content/albums/<slug>/original
  3) Create content/albums/<slug>/album.json
  4) (Optional) Create public/albums/<slug>/{cover,thumbs,webp}
  5) Save album access metadata (public/protected)
`;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isAbortError(error) {
  return (
    !!error &&
    typeof error === "object" &&
    ("code" in error || "name" in error) &&
    (error.code === "ABORT_ERR" || error.name === "AbortError")
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function toSlug(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function ask(rl, label, { required = false, defaultValue = "" } = {}) {
  while (true) {
    const suffix = defaultValue ? ` (${defaultValue})` : "";
    const value = (await rl.question(`${label}${suffix}: `)).trim();
    if (value) return value;
    if (defaultValue) return defaultValue;
    if (!required) return "";
    console.log("该项必填，请重新输入。");
  }
}

async function askYesNo(rl, label, defaultYes = false) {
  const hint = defaultYes ? "Y/n" : "y/N";
  while (true) {
    const value = (await rl.question(`${label} (${hint}): `)).trim().toLowerCase();
    if (!value) return defaultYes;
    if (value === "y" || value === "yes") return true;
    if (value === "n" || value === "no") return false;
    console.log("请输入 y 或 n。");
  }
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(HELP_TEXT.trim());
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  let cancelled = false;
  const onSigint = () => {
    cancelled = true;
    rl.close();
  };
  process.once("SIGINT", onSigint);

  try {
    console.log("新建图集向导");
    console.log("----------------");

    const title = await ask(rl, "图集标题", { required: true });

    let slugDefault = toSlug(title) || `album-${Date.now()}`;
    let slug = await ask(rl, "图集 slug（小写字母/数字/短横线）", {
      defaultValue: slugDefault,
      required: true,
    });

    while (!SLUG_PATTERN.test(slug)) {
      console.log("slug 格式不合法，示例：2026-city-walk");
      slug = await ask(rl, "请重新输入 slug", { defaultValue: slugDefault, required: true });
    }

    const description = await ask(rl, "图集描述");
    const date = await ask(rl, "日期 YYYY-MM-DD", { defaultValue: today() });
    const cover = await ask(rl, "封面文件名", { defaultValue: "001.jpg" });
    const requiresPassword = await askYesNo(
      rl,
      "该图集是否需要密码访问（写入元数据）",
      false,
    );
    const passwordHint = requiresPassword
      ? await ask(rl, "密码提示（可留空）")
      : "";
    const makePublicDirs = await askYesNo(
      rl,
      "是否同时创建 public/albums/<slug> 目录（cover/thumbs/webp）",
      false,
    );

    const root = process.cwd();
    const albumDir = path.join(root, "content", "albums", slug);
    const originalDir = path.join(albumDir, "original");
    const albumFile = path.join(albumDir, "album.json");

    if (await pathExists(albumDir)) {
      const shouldContinue = await askYesNo(
        rl,
        `目录已存在：content/albums/${slug}，是否继续写入/覆盖 album.json`,
        false,
      );
      if (!shouldContinue) {
        console.log("已取消。");
        return;
      }
    }

    await fs.mkdir(originalDir, { recursive: true });

    const albumData = {
      slug,
      title,
      description,
      date,
      cover,
      requiresPassword,
      ...(requiresPassword && passwordHint ? { passwordHint } : {}),
    };

    await fs.writeFile(albumFile, `${JSON.stringify(albumData, null, 2)}\n`, "utf8");

    if (makePublicDirs) {
      const publicBase = path.join(root, "public", "albums", slug);
      await Promise.all([
        fs.mkdir(path.join(publicBase, "cover"), { recursive: true }),
        fs.mkdir(path.join(publicBase, "thumbs"), { recursive: true }),
        fs.mkdir(path.join(publicBase, "webp"), { recursive: true }),
      ]);
    }

    console.log("");
    console.log("创建完成：");
    console.log(`- content/albums/${slug}/original`);
    console.log(`- content/albums/${slug}/album.json`);
    if (makePublicDirs) {
      console.log(`- public/albums/${slug}/{cover,thumbs,webp}`);
    }
    console.log("");
    console.log("下一步：把原图放进 original/，再运行生成脚本。");
  } catch (error) {
    if (cancelled || isAbortError(error)) {
      console.log("\n已取消。");
      return;
    }
    throw error;
  } finally {
    process.off("SIGINT", onSigint);
    rl.close();
  }
}

main().catch((error) => {
  if (isAbortError(error)) {
    console.log("\n已取消。");
    return;
  }
  console.error("创建失败：", error);
  process.exitCode = 1;
});
