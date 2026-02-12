# Blog

一个基于 `Next.js 16` 的个人博客项目，包含：
- 首页信息展示
- 笔记系统（MDX、目录、代码高亮、复制、图片预览）
- 相册系统（图集、封面、缩略图、密码访问）
- Moments 页面
- RSS（仅笔记）

## 技术栈
- `Next.js 16` + `React 19`
- `Tailwind CSS v4`
- `next-themes`（主题切换）
- `next-mdx-remote` + `remark-gfm` + `rehype-pretty-code`
- `Biome`（格式与检查）
- `sharp`（相册图片处理）

## 本地开发
```bash
pnpm install
pnpm dev
```

默认访问：`http://localhost:3000`

## Docker 部署
### 使用 Docker Compose（推荐）
1. 在项目根目录准备环境变量（可选）：
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
SITE_URL=https://your-domain.com
POSTS_ACCESS_PASSWORD=your-notes-password
ALBUM_ACCESS_PASSWORD=your-albums-password
```
2. 注入 git 信息（用于页脚 hash 和首页更新次数）：
```powershell
$env:GIT_COMMIT_SHA = git rev-parse --short HEAD
$env:GIT_COMMIT_COUNT = git rev-list --count HEAD
```
3. 构建并启动：
```bash
docker compose up -d --build
```
4. 访问：`http://localhost:3000`

### 使用 Docker 命令
```bash
docker build -t blog-next:latest \
  --build-arg GIT_COMMIT_SHA=$(git rev-parse --short HEAD) \
  --build-arg GIT_COMMIT_COUNT=$(git rev-list --count HEAD) .

docker run -d --name blog-next -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=https://your-domain.com \
  -e SITE_URL=https://your-domain.com \
  -e POSTS_ACCESS_PASSWORD=your-notes-password \
  -e ALBUM_ACCESS_PASSWORD=your-albums-password \
  blog-next:latest
```

## 环境变量
在项目根目录创建 `.env.local`：

```bash
# RSS 站点地址（可选，未配置时默认 http://localhost:3000）
NEXT_PUBLIC_SITE_URL=https://your-domain.com
# 或者
SITE_URL=https://your-domain.com

# 启用笔记密码保护（可选）
POSTS_ACCESS_PASSWORD=your-notes-password

# 启用相册密码保护（可选）
ALBUM_ACCESS_PASSWORD=your-albums-password
```

说明：
- 配置 `POSTS_ACCESS_PASSWORD` 后，`/notes` 受中间件保护，需先解锁。
- 配置 `ALBUM_ACCESS_PASSWORD` 后，`/albums` 受中间件保护，需先解锁。
- 不配置对应密码时，该分区默认公开。

## 内容目录初始化（重要）
`content/` 已加入 `.gitignore`，默认不提交到 GitHub。

首次拉取仓库后，请手动创建内容目录：

```text
content/
  posts/
    2026/
  albums/
```

可选：PowerShell 快速创建

```powershell
New-Item -ItemType Directory -Force content/posts/2026 | Out-Null
New-Item -ItemType Directory -Force content/albums | Out-Null
```

## 内容管理

### 笔记（MDX）
- 目录：`content/posts/<year>/*.mdx`
- 示例：`content/posts/2026/hello.mdx`

最小 frontmatter 示例：

```mdx
---
title: Hello
date: 2026-02-12
summary: 简短摘要
tags: [nextjs, mdx]
---

正文内容。
```

常用 frontmatter 字段：
- `title`
- `date`（`YYYY-MM-DD`）
- `summary`
- `tags`
- `draft`（`true` 时生产环境不展示）
- `updatedAt`
- `requiresPassword`
- `passwordHint`

### 相册
1. 交互式创建图集目录与元数据：
```bash
pnpm album:new
```
2. 把原图放入：
- `content/albums/<slug>/original/`
3. 生成封面、webp、thumbs、manifest：
```bash
pnpm album:generate
```

仅生成指定图集：
```bash
pnpm album:generate <slug>
```

可选图片处理参数（环境变量）：
- `ALBUM_THUMB_WIDTH`
- `ALBUM_WEBP_WIDTH`
- `ALBUM_THUMB_QUALITY`
- `ALBUM_WEBP_QUALITY`
- `ALBUM_COVER_WIDTH`
- `ALBUM_COVER_HEIGHT`
- `ALBUM_COVER_WEBP_QUALITY`
- `ALBUM_COVER_JPEG_QUALITY`

## RSS
- 地址：`/rss.xml`
- 当前仅输出笔记列表
- 自动排除：`draft` 和需要密码的笔记

## 常用脚本
```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm format
pnpm album:new
pnpm album:generate
```

## 目录结构
```text
Dockerfile
docker-compose.yml
src/
  app/
    page.tsx
    notes/
    albums/
    moments/
    projects/
    rss.xml/route.ts
  components/
  lib/
public/
scripts/
```

## 部署说明
- 推荐 Node.js 20+
- `next/font/google` 在构建时需要联网拉取字体
- 离线构建场景建议改用本地字体（`next/font/local`）
