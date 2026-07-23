import { existsSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { loadLocalEnv } from "./env";
import { listLocalAssets } from "./files";

loadLocalEnv();

type ImageReference = {
  source: string;
  value: string;
};

const uniqueValues = (items: ImageReference[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(`${item.source}:${item.value}`)) return false;
    seen.add(`${item.source}:${item.value}`);
    return true;
  });
};

const collectDbReferences = async () => {
  if (!process.env.DATABASE_URL) {
    return {
      skipped: true,
      reason: "DATABASE_URL is not configured.",
      references: [] as ImageReference[],
    };
  }

  const prisma = new PrismaClient();
  try {
    const [
      products,
      news,
      events,
      avatars,
      users,
      decks,
      tournaments,
      tournamentPlayers,
    ] = await Promise.all([
      prisma.productImage.findMany({ select: { url: true } }),
      prisma.new.findMany({ select: { featuredImage: true, cardImage: true } }),
      prisma.event.findMany({ select: { featuredImage: true, cardImage: true } }),
      prisma.avatar.findMany({ select: { imageUrl: true } }),
      prisma.user.findMany({
        select: { image: true, bannerImage: true, frameImage: true },
      }),
      prisma.deck.findMany({ select: { imagen: true } }),
      prisma.tournament.findMany({ select: { image: true } }),
      prisma.tournamentPlayer.findMany({ select: { image: true } }),
    ]);

    const references: ImageReference[] = [];
    products.forEach((item) =>
      item.url && references.push({ source: "ProductImage.url", value: item.url }),
    );
    news.forEach((item) => {
      references.push({ source: "New.featuredImage", value: item.featuredImage });
      references.push({ source: "New.cardImage", value: item.cardImage });
    });
    events.forEach((item) => {
      references.push({ source: "Event.featuredImage", value: item.featuredImage });
      references.push({ source: "Event.cardImage", value: item.cardImage });
    });
    avatars.forEach((item) =>
      references.push({ source: "Avatar.imageUrl", value: item.imageUrl }),
    );
    users.forEach((item) => {
      item.image && references.push({ source: "User.image", value: item.image });
      item.bannerImage &&
        references.push({ source: "User.bannerImage", value: item.bannerImage });
      item.frameImage &&
        references.push({ source: "User.frameImage", value: item.frameImage });
    });
    decks.forEach((item) =>
      references.push({ source: "Deck.imagen", value: item.imagen }),
    );
    tournaments.forEach((item) =>
      item.image &&
        references.push({ source: "Tournament.image", value: item.image }),
    );
    tournamentPlayers.forEach((item) =>
      item.image &&
        references.push({ source: "TournamentPlayer.image", value: item.image }),
    );

    return {
      skipped: false,
      databaseUrlHint: process.env.DATABASE_URL.replace(/\/\/.*@/, "//***@"),
      references: uniqueValues(references),
    };
  } finally {
    await prisma.$disconnect();
  }
};

const main = async () => {
  const publicRoot = resolve(process.cwd(), "public");
  const localAssets = existsSync(publicRoot) ? listLocalAssets(publicRoot) : [];
  const db = await collectDbReferences();

  console.log(
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        publicAssets: {
          root: publicRoot,
          count: localAssets.length,
          totalBytes: localAssets.reduce((sum, item) => sum + item.size, 0),
          folders: localAssets.reduce<Record<string, number>>((acc, item) => {
            const folder = item.key.split("/")[0] ?? "";
            acc[folder] = (acc[folder] ?? 0) + 1;
            return acc;
          }, {}),
        },
        dbReferences: {
          skipped: db.skipped,
          reason: "reason" in db ? db.reason : undefined,
          databaseUrlHint: "databaseUrlHint" in db ? db.databaseUrlHint : undefined,
          count: db.references.length,
          bySource: db.references.reduce<Record<string, number>>((acc, item) => {
            acc[item.source] = (acc[item.source] ?? 0) + 1;
            return acc;
          }, {}),
          references: db.references,
        },
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error("[r2:inventory]", error);
  process.exitCode = 1;
});
