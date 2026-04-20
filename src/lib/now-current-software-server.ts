import fs from "node:fs/promises";
import path from "node:path";
import type { NowSoftwareIcon } from "@/lib/now-current-software";

function formatSoftwareLabel(filename: string) {
  return filename
    .replace(/\.svg$/i, "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

async function collectSvgFiles(
  rootDir: string,
  currentDir = rootDir,
): Promise<string[]> {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry): Promise<string[]> => {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        return collectSvgFiles(rootDir, fullPath);
      }

      if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) {
        return [path.relative(rootDir, fullPath)];
      }

      return [];
    }),
  );

  return files.flat();
}

export async function readNowSoftwareIcons(): Promise<NowSoftwareIcon[]> {
  const imageRoot = path.join(process.cwd(), "public", "image");
  const files = await collectSvgFiles(imageRoot);

  return files
    .sort((left, right) => left.localeCompare(right, "en"))
    .map((file) => ({
      src: `/image/${file.split(path.sep).join("/")}`,
      label: formatSoftwareLabel(path.basename(file)),
    }));
}
