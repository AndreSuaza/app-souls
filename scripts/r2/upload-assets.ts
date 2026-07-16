import { readFileSync } from "fs";
import { resolve } from "path";
import { listLocalAssets } from "./files";
import { putObject } from "./r2-client";

const hasArg = (name: string) => process.argv.includes(name);
const getArgValue = (name: string, fallback: string) => {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
};

const withKeyPrefix = (prefix: string, key: string) => {
  const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, "");
  if (!normalizedPrefix) return key;
  return `${normalizedPrefix}/${key}`;
};

const main = async () => {
  const apply = hasArg("--apply");
  const root = resolve(process.cwd(), getArgValue("--source-dir", "public"));
  const assets = listLocalAssets(root);
  const keyPrefix = getArgValue("--key-prefix", "");
  const cacheControl = getArgValue(
    "--cache-control",
    "public, max-age=31536000, immutable",
  );

  console.log(
    `[r2:upload-assets] ${apply ? "upload" : "dry-run"} ${assets.length} files from ${root}`,
  );

  for (const asset of assets) {
    const key = withKeyPrefix(keyPrefix, asset.key);
    if (!apply) {
      console.log(`[dry-run] ${key} ${asset.size} bytes`);
      continue;
    }

    await putObject({
      key,
      body: readFileSync(asset.absolutePath),
      contentType: asset.contentType,
      cacheControl,
    });
    console.log(`[uploaded] ${key}`);
  }
};

main().catch((error) => {
  console.error("[r2:upload-assets]", error);
  process.exitCode = 1;
});
