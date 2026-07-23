import { resolve } from "path";
import { listLocalAssets } from "./files";
import { headObject } from "./r2-client";

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
  const root = resolve(process.cwd(), getArgValue("--source-dir", "public"));
  const keyPrefix = getArgValue("--key-prefix", "");
  const assets = listLocalAssets(root);
  const failures: Array<{ key: string; reason: string }> = [];

  for (const asset of assets) {
    const key = withKeyPrefix(keyPrefix, asset.key);
    try {
      const remote = await headObject(key);
      if (remote.ContentLength !== asset.size) {
        failures.push({
          key,
          reason: `size mismatch local=${asset.size} remote=${remote.ContentLength}`,
        });
        continue;
      }
      console.log(`[ok] ${key}`);
    } catch (error) {
      failures.push({
        key,
        reason: error instanceof Error ? error.message : "unknown error",
      });
    }
  }

  if (failures.length > 0) {
    console.error(JSON.stringify({ failures }, null, 2));
    process.exitCode = 1;
    return;
  }

  console.log(`[r2:validate-assets] validated ${assets.length} files`);
};

main().catch((error) => {
  console.error("[r2:validate-assets]", error);
  process.exitCode = 1;
});
