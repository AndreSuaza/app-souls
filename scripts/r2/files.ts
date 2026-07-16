import { createHash } from "crypto";
import { readdirSync, readFileSync, statSync } from "fs";
import { extname, join, relative } from "path";

export type LocalAsset = {
  absolutePath: string;
  key: string;
  size: number;
  sha256: string;
  contentType: string;
};

const CONTENT_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const toKey = (root: string, absolutePath: string) =>
  relative(root, absolutePath).replace(/\\/g, "/");

export const getContentType = (filePath: string) =>
  CONTENT_TYPES[extname(filePath).toLowerCase()] ?? "application/octet-stream";

export const listLocalAssets = (root: string): LocalAsset[] => {
  const assets: LocalAsset[] = [];

  const walk = (current: string) => {
    readdirSync(current).forEach((name) => {
      const absolutePath = join(current, name);
      const stats = statSync(absolutePath);

      if (stats.isDirectory()) {
        walk(absolutePath);
        return;
      }

      if (!stats.isFile()) return;

      const buffer = readFileSync(absolutePath);
      assets.push({
        absolutePath,
        key: toKey(root, absolutePath),
        size: stats.size,
        sha256: createHash("sha256").update(buffer).digest("hex"),
        contentType: getContentType(absolutePath),
      });
    });
  };

  walk(root);
  return assets.sort((a, b) => a.key.localeCompare(b.key));
};
