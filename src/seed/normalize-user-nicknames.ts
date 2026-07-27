import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

type UserNickname = {
  id: string;
  nickname: string;
  createdAt: Date;
};

type PlannedUpdate = {
  id: string;
  oldNickname: string;
  newNickname: string;
  reason: "duplicate" | "normalize-survivor";
};

const MAX_NICKNAME_LENGTH = 15;

const hasArg = (name: string) => process.argv.includes(name);

const parseEnvLine = (line: string) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (!match) return null;

  const key = match[1];
  let value = match[2] ?? "";
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
};

const loadLocalEnv = () => {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const parsed = parseEnvLine(line);
    if (!parsed || process.env[parsed.key] !== undefined) return;
    process.env[parsed.key] = parsed.value;
  });
};

const getRequiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const getApplySafety = (databaseUrl: string) => {
  if (/six2/i.test(databaseUrl)) return "production-six2";
  if (/sixdev/i.test(databaseUrl)) return "development-sixdev";
  return "unknown-database";
};

const normalizeNickname = (nickname: string) => nickname.trim().toLowerCase();

const compareUsers = (a: UserNickname, b: UserNickname) => {
  const createdAtDiff = a.createdAt.getTime() - b.createdAt.getTime();
  if (createdAtDiff !== 0) return createdAtDiff;
  return a.id.localeCompare(b.id);
};

const buildSuffixedNickname = (baseNickname: string, suffix: number) => {
  const suffixText = String(suffix);
  const baseLength = Math.max(1, MAX_NICKNAME_LENGTH - suffixText.length);
  return `${baseNickname.slice(0, baseLength)}${suffixText}`;
};

const nextAvailableNickname = (
  baseNickname: string,
  reservedNicknames: Set<string>,
) => {
  let suffix = 2;
  while (true) {
    const candidate = buildSuffixedNickname(baseNickname, suffix);
    if (!reservedNicknames.has(candidate)) {
      reservedNicknames.add(candidate);
      return candidate;
    }
    suffix += 1;
  }
};

const buildUpdatePlan = (users: UserNickname[]) => {
  const groups = new Map<string, UserNickname[]>();
  const reservedNicknames = new Set(users.map((user) => normalizeNickname(user.nickname)));

  for (const user of users) {
    const normalizedNickname = normalizeNickname(user.nickname);
    const group = groups.get(normalizedNickname) ?? [];
    group.push(user);
    groups.set(normalizedNickname, group);
  }

  const updates: PlannedUpdate[] = [];

  for (const [normalizedNickname, group] of groups) {
    if (group.length < 2) continue;

    const sortedGroup = [...group].sort(compareUsers);
    const exactLowercaseUser =
      sortedGroup.find((user) => user.nickname === normalizedNickname) ?? null;
    const survivor = exactLowercaseUser ?? sortedGroup[sortedGroup.length - 1];
    if (!survivor) continue;

    for (const user of sortedGroup) {
      if (user.id === survivor.id) continue;

      updates.push({
        id: user.id,
        oldNickname: user.nickname,
        newNickname: nextAvailableNickname(normalizedNickname, reservedNicknames),
        reason: "duplicate",
      });
    }

    if (survivor.nickname !== normalizedNickname) {
      updates.push({
        id: survivor.id,
        oldNickname: survivor.nickname,
        newNickname: normalizedNickname,
        reason: "normalize-survivor",
      });
    }
  }

  return updates;
};

const main = async () => {
  loadLocalEnv();
  const databaseUrl = getRequiredEnv("DATABASE_URL");
  const apply = hasArg("--apply");

  const prisma = new PrismaClient();

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        createdAt: true,
      },
    });

    const updates = buildUpdatePlan(users);
    const duplicateGroups = new Set(
      updates.map((update) => normalizeNickname(update.oldNickname)),
    ).size;

    console.log(
      JSON.stringify(
        {
          mode: apply ? "apply" : "dry-run",
          database: databaseUrl.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@"),
          applySafety: getApplySafety(databaseUrl),
          duplicateGroups,
          plannedUpdates: updates.length,
          updates,
        },
        null,
        2,
      ),
    );

    if (!apply || updates.length === 0) return;

    await prisma.$transaction(
      updates.map((update) =>
        prisma.user.update({
          where: { id: update.id },
          data: { nickname: update.newNickname },
        }),
      ),
    );

    console.log(`Nicknames actualizados: ${updates.length}`);
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
