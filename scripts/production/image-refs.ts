import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { getRequiredEnv, loadLocalEnv } from "../r2/env";
import { createR2Client, getBucketName } from "../r2/r2-client";

loadLocalEnv();

const prisma = new PrismaClient();

type Command = "audit" | "migrate" | "rollback" | "verify";
type ModelName =
  | "Card"
  | "ProductImage"
  | "User"
  | "Avatar"
  | "New"
  | "Event"
  | "Tournament"
  | "TournamentPlayer"
  | "Deck";

type FieldMode = "single" | "content";

type FieldSpec = {
  field: string;
  mode: FieldMode;
};

type ModelSpec = {
  model: ModelName;
  delegate: string;
  fields: FieldSpec[];
};

type BackupField = {
  field: string;
  value: string | null;
};

type BackupEntry = {
  model: ModelName;
  delegate: string;
  id: string;
  fields: BackupField[];
};

type Change = {
  model: ModelName;
  delegate: string;
  id: string;
  field: string;
  from: string | null;
  to: string;
  keys: string[];
};

type ReportEntry = {
  model: ModelName;
  id: string;
  field: string;
  value: string;
  reason: string;
};

const MODEL_SPECS: ModelSpec[] = [
  { model: "Card", delegate: "card", fields: [{ field: "imageUrl", mode: "single" }] },
  { model: "ProductImage", delegate: "productImage", fields: [{ field: "url", mode: "single" }] },
  {
    model: "User",
    delegate: "user",
    fields: [
      { field: "image", mode: "single" },
      { field: "bannerImage", mode: "single" },
      { field: "frameImage", mode: "single" },
    ],
  },
  { model: "Avatar", delegate: "avatar", fields: [{ field: "imageUrl", mode: "single" }] },
  {
    model: "New",
    delegate: "new",
    fields: [
      { field: "featuredImage", mode: "single" },
      { field: "cardImage", mode: "single" },
      { field: "content", mode: "content" },
    ],
  },
  {
    model: "Event",
    delegate: "event",
    fields: [
      { field: "featuredImage", mode: "single" },
      { field: "cardImage", mode: "single" },
      { field: "content", mode: "content" },
    ],
  },
  { model: "Tournament", delegate: "tournament", fields: [{ field: "image", mode: "single" }] },
  {
    model: "TournamentPlayer",
    delegate: "tournamentPlayer",
    fields: [{ field: "image", mode: "single" }],
  },
  { model: "Deck", delegate: "deck", fields: [{ field: "imagen", mode: "single" }] },
];

const R2_FOLDERS = [
  "cards",
  "decks",
  "events",
  "news",
  "products",
  "profile",
  "tournaments",
] as const;
const LOCAL_PROJECT_PREFIXES = ["product-pages/"];
const SYMBOLIC_VALUES = new Set(["player"]);
const HTTP_URL_PATTERN = /https?:\/\/(?:(?!\)!\[|&nbsp;?)[^\s"'<>])+/g;
const LOCAL_ASSET_PATTERN =
  /(["'(=])\/(cards|decks|events|news|products|profile|tournaments)\/([^"'()<>\s]+)/g;

const command = (process.argv[2] ?? "audit") as Command;
const hasArg = (name: string) => process.argv.includes(name);
const getArgValue = (name: string) => {
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);

  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
};

const getAssetsBaseUrl = () =>
  (process.env.NEXT_PUBLIC_ASSETS_BASE_URL ?? "https://assets.soulsinxtinction.com").replace(
    /\/+$/,
    "",
  );

const assertKnownCommand = () => {
  if (!["audit", "migrate", "rollback", "verify"].includes(command)) {
    throw new Error(`Unknown command: ${command}`);
  }
};

const getDatabaseName = () => {
  const databaseUrl = getRequiredEnv("DATABASE_URL");
  const match = databaseUrl.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/i);
  return match?.[1] ?? "";
};

const assertDatabaseWriteConfirmed = () => {
  const databaseName = getDatabaseName();
  if (!hasArg("--confirm-database-write")) {
    throw new Error(
      `This command writes to DATABASE_URL (${databaseName || "unknown"}). Pass --confirm-database-write to continue.`,
    );
  }
};

const normalizeSlashes = (value: string) => value.replace(/\\/g, "/");
const stripQueryHash = (value: string) => value.split(/[?#]/, 1)[0] ?? "";

const splitUrlCandidate = (value: string) => {
  let url = value;
  let suffix = "";

  while (/[.,;:]$/.test(url)) {
    suffix = `${url.at(-1)}${suffix}`;
    url = url.slice(0, -1);
  }

  const openParens = () => (url.match(/\(/g) ?? []).length;
  const closeParens = () => (url.match(/\)/g) ?? []).length;

  while (url.endsWith(")") && closeParens() > openParens()) {
    suffix = `)${suffix}`;
    url = url.slice(0, -1);
  }

  return { url, suffix };
};

const isHttpUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

const getFolder = (key: string) => key.split("/", 1)[0] ?? "";

const isR2Folder = (key: string) =>
  R2_FOLDERS.some((folder) => key === folder || key.startsWith(`${folder}/`));

const isLocalProjectAsset = (key: string) =>
  LOCAL_PROJECT_PREFIXES.some((prefix) => key.startsWith(prefix));

const normalizeAssetKey = (value: string) => {
  let key = stripQueryHash(normalizeSlashes(value.trim())).replace(/^\/+/, "");
  if (key.startsWith("souls/")) key = key.slice("souls/".length);

  if (key.startsWith("_next/image")) {
    try {
      const nested = new URL(`https://local.invalid/${key}`).searchParams.get("url");
      if (nested) return normalizeAssetKey(decodeURIComponent(nested));
    } catch {
      return key;
    }
  }

  if (getFolder(key).toLowerCase() === "products") {
    const rest = key.slice("products/".length);
    return `products/${rest.toLowerCase()}`;
  }

  return key;
};

const toStorageUrl = (key: string) => `${getAssetsBaseUrl()}/${key}`;

const normalizeSingleValue = (value: string | null | undefined) => {
  if (!value) return null;

  const original = value.trim();
  if (!original || SYMBOLIC_VALUES.has(original) || original.startsWith("blob:")) return null;

  if (!isHttpUrl(original) && isLocalProjectAsset(original.replace(/^\/+/, ""))) {
    return null;
  }

  if (isHttpUrl(original)) {
    let parsed: URL;
    try {
      parsed = new URL(original);
    } catch {
      return null;
    }

    if (parsed.pathname === "/_next/image") {
      const nested = parsed.searchParams.get("url");
      if (nested) return normalizeSingleValue(decodeURIComponent(nested));
    }

    const baseUrl = new URL(getAssetsBaseUrl());
    const isAssetsHost = parsed.origin === baseUrl.origin;
    const isVercelBlob = parsed.hostname.includes("vercel-storage.com");
    if (!isAssetsHost && !isVercelBlob) return null;

    const key = normalizeAssetKey(parsed.pathname);
    if (!isR2Folder(key)) return null;

    return {
      value: toStorageUrl(key),
      keys: [key],
      reason: isVercelBlob ? "vercel-blob-url" : "asset-url-normalized",
    };
  }

  const key = normalizeAssetKey(original);
  if (!isR2Folder(key)) return null;

  return {
    value: toStorageUrl(key),
    keys: [key],
    reason: original.startsWith("/") ? "local-r2-path" : "relative-r2-path",
  };
};

const normalizeContentValue = (value: string | null | undefined) => {
  if (!value) return null;

  const keys = new Set<string>();
  let changed = false;
  let normalized = value.replace(HTTP_URL_PATTERN, (match) => {
    const candidate = splitUrlCandidate(match);
    const result = normalizeSingleValue(candidate.url);
    if (!result || result.value === candidate.url) return match;
    result.keys.forEach((key) => keys.add(key));
    changed = true;
    return `${result.value}${candidate.suffix}`;
  });

  normalized = normalized.replace(LOCAL_ASSET_PATTERN, (match, prefix, folder, rest) => {
    const result = normalizeSingleValue(`/${folder}/${rest}`);
    if (!result) return match;
    result.keys.forEach((key) => keys.add(key));
    changed = true;
    return `${prefix}${result.value}`;
  });

  if (!changed || normalized === value) return null;
  return {
    value: normalized,
    keys: Array.from(keys),
    reason: "content-asset-refs",
  };
};

const extractKeysFromSingleValue = (value: unknown): string[] => {
  if (typeof value !== "string") return [];

  const normalized = normalizeSingleValue(value);
  if (normalized) return normalized.keys;

  const original = value.trim();
  if (!original || SYMBOLIC_VALUES.has(original) || original.startsWith("blob:")) return [];
  if (!isHttpUrl(original)) return [];

  try {
    const parsed = new URL(original);
    const baseUrl = new URL(getAssetsBaseUrl());
    if (parsed.origin !== baseUrl.origin) return [];
    const key = normalizeAssetKey(parsed.pathname);
    return isR2Folder(key) ? [key] : [];
  } catch {
    return [];
  }
};

const extractKeysFromContentValue = (value: unknown): string[] => {
  if (typeof value !== "string") return [];

  const keys = new Set<string>();
  for (const match of value.matchAll(HTTP_URL_PATTERN)) {
    extractKeysFromSingleValue(splitUrlCandidate(match[0]).url).forEach((key) =>
      keys.add(key),
    );
  }
  for (const match of value.matchAll(LOCAL_ASSET_PATTERN)) {
    const [, , folder, rest] = match;
    extractKeysFromSingleValue(`/${folder}/${rest}`).forEach((key) => keys.add(key));
  }
  return Array.from(keys);
};

const inspectSingleValue = (
  model: ModelName,
  id: string,
  field: string,
  value: unknown,
): ReportEntry | null => {
  if (typeof value !== "string" || !value.trim() || SYMBOLIC_VALUES.has(value)) return null;
  const normalized = normalizeSingleValue(value);
  if (normalized && normalized.value !== value) {
    return { model, id, field, value, reason: normalized.reason };
  }
  if (value.includes("vercel-storage.com")) {
    return { model, id, field, value, reason: "unresolved-vercel-blob-url" };
  }
  return null;
};

const getDelegate = (delegate: string) =>
  (prisma as unknown as Record<string, { findMany: Function; update: Function }>)[delegate];

const getRows = async (spec: ModelSpec) => {
  const select = Object.fromEntries([["id", true], ...spec.fields.map((field) => [field.field, true])]);
  return getDelegate(spec.delegate).findMany({ select });
};

const collectChanges = async () => {
  const changes: Change[] = [];
  const report: ReportEntry[] = [];

  for (const spec of MODEL_SPECS) {
    const rows = await getRows(spec);
    for (const row of rows) {
      const id = String(row.id);
      for (const field of spec.fields) {
        const current = row[field.field] as unknown;
        if (typeof current !== "string") continue;

        const normalized =
          field.mode === "content"
            ? normalizeContentValue(current)
            : normalizeSingleValue(current);

        if (normalized && normalized.value !== current) {
          changes.push({
            model: spec.model,
            delegate: spec.delegate,
            id,
            field: field.field,
            from: current,
            to: normalized.value,
            keys: normalized.keys,
          });
          report.push({
            model: spec.model,
            id,
            field: field.field,
            value: current,
            reason: normalized.reason,
          });
          continue;
        }

        const inspected = inspectSingleValue(spec.model, id, field.field, current);
        if (inspected) report.push(inspected);
      }
    }
  }

  return { changes, report };
};

const collectCurrentAssetKeys = async () => {
  const keys = new Set<string>();

  for (const spec of MODEL_SPECS) {
    const rows = await getRows(spec);
    for (const row of rows) {
      for (const field of spec.fields) {
        const current = row[field.field] as unknown;
        const fieldKeys =
          field.mode === "content"
            ? extractKeysFromContentValue(current)
            : extractKeysFromSingleValue(current);
        fieldKeys.forEach((key) => keys.add(key));
      }
    }
  }

  return Array.from(keys);
};

const getAllowMissingKeys = () =>
  new Set(
    (getArgValue("--allow-missing") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );

const verifyKeysExist = async (keys: string[]) => {
  const allowMissing = getAllowMissingKeys();
  const client = createR2Client();
  const bucket = getBucketName();
  const uniqueKeys = Array.from(new Set(keys)).sort();
  const folders = Array.from(
    new Set(uniqueKeys.map((key) => getFolder(key)).filter(Boolean)),
  ).sort();
  const availableKeys = new Set<string>();
  const missing: string[] = [];

  for (const folder of folders) {
    let continuationToken: string | undefined;
    do {
      const response = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: `${folder}/`,
          ContinuationToken: continuationToken,
        }),
      );

      for (const object of response.Contents ?? []) {
        if (object.Key) availableKeys.add(object.Key);
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
  }

  for (const key of uniqueKeys) {
    if (allowMissing.has(key)) continue;
    if (!availableKeys.has(key)) {
      missing.push(key);
    }
  }

  return missing;
};

const groupChangesForBackup = (changes: Change[]) => {
  const grouped = new Map<string, BackupEntry>();

  for (const change of changes) {
    const key = `${change.delegate}:${change.id}`;
    const entry =
      grouped.get(key) ??
      ({
        model: change.model,
        delegate: change.delegate,
        id: change.id,
        fields: [],
      } satisfies BackupEntry);
    entry.fields.push({ field: change.field, value: change.from });
    grouped.set(key, entry);
  }

  return Array.from(grouped.values());
};

const writeBackup = (entries: BackupEntry[]) => {
  const backupDir = resolve(process.cwd(), "migration-backups");
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = resolve(backupDir, `image-ref-migration-${timestamp}.json`);
  writeFileSync(
    backupPath,
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        database: getDatabaseName(),
        entries,
      },
      null,
      2,
    ),
  );
  return backupPath;
};

const applyChanges = async (changes: Change[]) => {
  const grouped = new Map<string, { delegate: string; id: string; data: Record<string, string> }>();

  for (const change of changes) {
    const key = `${change.delegate}:${change.id}`;
    const entry =
      grouped.get(key) ?? { delegate: change.delegate, id: change.id, data: {} };
    entry.data[change.field] = change.to;
    grouped.set(key, entry);
  }

  const updates = Array.from(grouped.values());
  console.log(`[prod:migrate-image-refs] applying ${updates.length} documents`);

  let applied = 0;
  for (const update of grouped.values()) {
    await getDelegate(update.delegate).update({
      where: { id: update.id },
      data: update.data,
    });

    applied += 1;
    if (applied % 50 === 0 || applied === updates.length) {
      console.log(`[prod:migrate-image-refs] applied ${applied}/${updates.length} documents`);
    }
  }
};

const runAudit = async () => {
  const { changes, report } = await collectChanges();
  console.log(
    `[prod:audit-image-refs] database=${getDatabaseName() || "unknown"} report=${report.length} changes=${changes.length}`,
  );
  console.log(JSON.stringify({ report: report.slice(0, 200) }, null, 2));
  if (report.length > 200) console.log(`[prod:audit-image-refs] ${report.length - 200} more entries omitted`);
};

const runMigrate = async () => {
  assertDatabaseWriteConfirmed();
  const execute = hasArg("--execute");
  const { changes } = await collectChanges();
  const currentKeys = await collectCurrentAssetKeys();
  const keys = [...changes.flatMap((change) => change.keys), ...currentKeys];
  const missing = await verifyKeysExist(keys);

  console.log(
    `[prod:migrate-image-refs] ${execute ? "execute" : "dry-run"} database=${getDatabaseName()} changes=${changes.length} keys=${new Set(keys).size} missing=${missing.length}`,
  );
  console.log(JSON.stringify({ sample: changes.slice(0, 25), missing }, null, 2));

  if (missing.length > 0) {
    throw new Error("R2 validation failed. Upload missing assets or pass --allow-missing=key1,key2 for intentional gaps.");
  }

  if (!execute) return;

  const backupPath = writeBackup(groupChangesForBackup(changes));
  await applyChanges(changes);
  console.log(`[prod:migrate-image-refs] updated ${changes.length} fields`);
  console.log(`[prod:migrate-image-refs] backup ${backupPath}`);
};

const runVerify = async () => {
  assertDatabaseWriteConfirmed();
  const { changes } = await collectChanges();
  const currentKeys = await collectCurrentAssetKeys();
  const keys = [...changes.flatMap((change) => change.keys), ...currentKeys];
  const missing = await verifyKeysExist(keys);

  console.log(
    `[prod:verify-image-refs] database=${getDatabaseName()} convertible=${changes.length} keys=${new Set(keys).size} missing=${missing.length}`,
  );
  if (missing.length > 0) {
    console.error(JSON.stringify({ missing }, null, 2));
    throw new Error("Some referenced R2 assets are missing.");
  }
};

const runRollback = async () => {
  assertDatabaseWriteConfirmed();
  if (!hasArg("--execute")) throw new Error("Rollback requires --execute.");

  const backupPath = getArgValue("--backup");
  if (!backupPath) throw new Error("Rollback requires --backup <path>.");

  const backup = JSON.parse(readFileSync(resolve(process.cwd(), backupPath), "utf8")) as {
    database?: string;
    entries: BackupEntry[];
  };

  if (
    !hasArg("--allow-cross-database-rollback") &&
    (backup.database ?? "") !== getDatabaseName()
  ) {
    throw new Error(
      `Backup database (${backup.database ?? "unknown"}) does not match DATABASE_URL (${getDatabaseName() || "unknown"}).`,
    );
  }

  for (const entry of backup.entries) {
    await getDelegate(entry.delegate).update({
      where: { id: entry.id },
      data: Object.fromEntries(entry.fields.map((field) => [field.field, field.value])),
    });
  }

  console.log(`[prod:rollback-image-refs] restored ${backup.entries.length} documents`);
};

const main = async () => {
  assertKnownCommand();

  if (command === "audit") await runAudit();
  if (command === "migrate") await runMigrate();
  if (command === "verify") await runVerify();
  if (command === "rollback") await runRollback();
};

main()
  .catch((error) => {
    console.error(`[prod:${command}-image-refs]`, error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
