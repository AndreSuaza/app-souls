import { prisma } from "../lib/prisma";

declare const process: { exit: (code?: number) => never };

type RunCommandRawResponse = {
  ok?: number;
  n?: number;
  nModified?: number;
};

const runRarityMigration = async (from: string, to: string) => {
  const response = (await prisma.$runCommandRaw({
    update: "Avatar",
    updates: [
      {
        q: { rarity: from },
        u: { $set: { rarity: to } },
        multi: true,
      },
    ],
  })) as RunCommandRawResponse;

  return response.nModified ?? response.n ?? 0;
};

const runNullDefault = async (field: string, value: boolean | number) => {
  const response = (await prisma.$runCommandRaw({
    update: "Avatar",
    updates: [
      {
        q: { [field]: null },
        u: { $set: { [field]: value } },
        multi: true,
      },
    ],
  })) as RunCommandRawResponse;

  return response.nModified ?? response.n ?? 0;
};

async function main() {
  const epicToUltra = await runRarityMigration("EPIC", "ULTRA");
  const legendaryToSecret = await runRarityMigration("LEGENDARY", "SECRET");
  const eventToAscended = await runRarityMigration("EVENT", "ASCENDED");

  const visibleDefaults = await runNullDefault("storeVisible", true);
  const seasonalDefaults = await runNullDefault("isSeasonal", false);
  const featuredDefaults = await runNullDefault("featured", false);
  const featuredOrderDefaults = await runNullDefault("featuredOrder", 0);

  console.log("Migracion de cosméticos completada:");
  console.table({
    epicToUltra,
    legendaryToSecret,
    eventToAscended,
    visibleDefaults,
    seasonalDefaults,
    featuredDefaults,
    featuredOrderDefaults,
  });
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error("Error migrando cosméticos:", error);
    process.exit(1);
  }
  await prisma.$disconnect();
})();
