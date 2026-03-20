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
1. 复制环境变量模板（可选）：
```bash
cp .env.docker.example .env.docker
```
PowerShell:
```powershell
Copy-Item .env.docker.example .env.docker
```
2. 注入 git 信息（用于页脚 hash 和首页更新次数）：
```powershell
$env:GIT_COMMIT_SHA = git rev-parse --short HEAD
$env:GIT_COMMIT_COUNT = git rev-list --count HEAD
```
3. 构建并启动（会自动挂载 `content/` 和 `public/albums/` 到容器）：
```bash
docker compose --env-file .env.docker up -d --build
```
4. 访问：`http://localhost:3000`

### 使用 Docker 命令
Linux/macOS:
```bash
docker build -t blog-next:latest \
  --build-arg GIT_COMMIT_SHA=$(git rev-parse --short HEAD) \
  --build-arg GIT_COMMIT_COUNT=$(git rev-list --count HEAD) .

docker run -d --name blog-next -p 3000:3000 \
  -v $(pwd)/content:/app/content \
  -v $(pwd)/public/albums:/app/public/albums \
  -e NEXT_PUBLIC_SITE_URL=https://your-domain.com \
  -e SITE_URL=https://your-domain.com \
  blog-next:latest
```

PowerShell:
```powershell
$env:GIT_COMMIT_SHA = git rev-parse --short HEAD
$env:GIT_COMMIT_COUNT = git rev-list --count HEAD
docker build -t blog-next:latest --build-arg GIT_COMMIT_SHA=$env:GIT_COMMIT_SHA --build-arg GIT_COMMIT_COUNT=$env:GIT_COMMIT_COUNT .
docker run -d --name blog-next -p 3000:3000 `
  -v ${PWD}\content:/app/content `
  -v ${PWD}\public\albums:/app/public/albums `
  -e NEXT_PUBLIC_SITE_URL=https://your-domain.com `
  -e SITE_URL=https://your-domain.com `
  blog-next:latest
```

## 环境变量
在项目根目录创建 `.env.local`：

```bash
# RSS 站点地址（可选，未配置时默认 http://localhost:3000）
NEXT_PUBLIC_SITE_URL=https://your-domain.com
# 或者
SITE_URL=https://your-domain.com
```

说明：
- 相册密码为单图集配置，在 `content/albums/<slug>/album.json` 使用 `password` 字段设置。
- 不配置对应密码时，该分区默认公开。

## 内容目录初始化（重要）
`content/` 已加入 `.gitignore`，默认不提交到 GitHub。

首次拉取仓库后，请手动创建内容目录：

```text
content/
  posts/
    2026/
  albums/
  moments/
```

可选：PowerShell 快速创建

```powershell
New-Item -ItemType Directory -Force content/posts/2026 | Out-Null
New-Item -ItemType Directory -Force content/albums | Out-Null
New-Item -ItemType Directory -Force content/moments | Out-Null
New-Item -ItemType Directory -Force public/albums | Out-Null
```

## 内容管理

### 笔记（MDX）
- 目录：`content/posts/<year>/*.mdx`
- 示例：`content/posts/2026/hello.mdx`

最小 frontmatter 示例：

```mdx
---
title: Hello
date: "2026-02-12"
summary: 简短摘要
tags: [nextjs, mdx]
---

正文内容。
```

常用 frontmatter 字段：
- `title`
- `date`（`YYYY-MM-DD`，建议加引号）
- `summary`
- `tags`
- `draft`（`true` 时生产环境不展示）
- `updatedAt`
- `aiPolished`（`true` 时详情页显示“本文已经过ai润色”）
- `requiresPassword`
- `password`（设置后该文章按单篇密码访问）
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
- Docker 镜像默认监听 `0.0.0.0:3000`
- 自托管场景建议挂载 `content/` 与 `public/albums/`，避免重建镜像后内容丢失
