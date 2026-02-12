import type { NextConfig } from "next";
import { execSync } from "node:child_process";

function resolveGitCommitHash() {
  const envHash =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.CF_PAGES_COMMIT_SHA ??
    process.env.GITHUB_SHA ??
    "";

  if (envHash) {
    return envHash.slice(0, 7);
  }

  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

function resolveGitCommitCount() {
  const envCount = process.env.VERCEL_GIT_COMMIT_COUNT ?? "";
  if (envCount) {
    return envCount;
  }

  try {
    return execSync("git rev-list --count HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "0";
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  transpilePackages: ["@lobehub/icons"],
  env: {
    NEXT_PUBLIC_GIT_COMMIT_HASH: resolveGitCommitHash(),
    NEXT_PUBLIC_GIT_COMMIT_COUNT: resolveGitCommitCount(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cat.cf.51111111.xyz",
      },
    ],
  },
};

export default nextConfig;
