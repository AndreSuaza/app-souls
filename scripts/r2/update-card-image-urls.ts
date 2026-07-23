import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { getRequiredEnv, loadLocalEnv } from "./env";
import { createR2Client, getBucketName } from "./r2-client";

loadLocalEnv();

const prisma = new PrismaClient();

const hasArg = (name: string) => process.argv.includes(name);

const getAssetsBaseUrl = () => getRequiredEnv("NEXT_PUBLIC_ASSETS_BASE_URL").replace(/\/+$/, "");

const assertSixDevDatabase = () => {
  const databaseUrl = getRequiredEnv("DATABASE_URL");

  if (/six2/i.test(databaseUrl)) {
    throw new Error("DATABASE_URL points to six2/Six2. Refusing to mutate data.");
  }

  if (!/sixdev/i.test(databaseUrl)) {
    throw new Error("DATABASE_URL must point to sixDev/SixDev for this migration.");
  }
};

const listR2CardKeys = async () => {
  const client = createR2Client();
  const bucket = getBucketName();
  const keys = new Set<string>();
  let continuationToken: string | undefined;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: "cards/",
        ContinuationToken: continuationToken,
      }),
    );

    for (const object of response.Contents ?? []) {
      if (object.Key?.toLowerCase().endsWith(".webp")) {
        keys.add(object.Key);
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return keys;
};

const resolveCardKey = ({
  code,
  idd,
  keys,
}: {
  code: string;
  idd: string;
  keys: Set<string>;
}) => {
  const exactKey = `cards/${code}-${idd}.webp`;
  if (keys.has(exactKey)) return exactKey;

  const prefix = `cards/${code}-`;
  const candidates = Array.from(keys).filter((key) => key.startsWith(prefix));
  return candidates.length === 1 ? candidates[0] : null;
};

const main = async () => {
  assertSixDevDatabase();

  const apply = hasArg("--apply");
  const assetsBaseUrl = getAssetsBaseUrl();
  const keys = await listR2CardKeys();
  const cards = await prisma.card.findMany({
    select: {
      id: true,
      code: true,
      idd: true,
      imageUrl: true,
    },
    orderBy: {
      code: "asc",
    },
  });

  const updates: Array<{
    id: string;
    code: string;
    idd: string;
    previousImageUrl: string | null;
    imageUrl: string;
  }> = [];
  const unresolved: Array<{ id: string; code: string; idd: string }> = [];

  for (const card of cards) {
    const key = resolveCardKey({ code: card.code, idd: card.idd, keys });
    if (!key) {
      unresolved.push({ id: card.id, code: card.code, idd: card.idd });
      continue;
    }

    const imageUrl = `${assetsBaseUrl}/${key}`;
    if (card.imageUrl !== imageUrl) {
      updates.push({
        id: card.id,
        code: card.code,
        idd: card.idd,
        previousImageUrl: card.imageUrl ?? null,
        imageUrl,
      });
    }
  }

  console.log(
    `[r2:update-card-image-urls] ${apply ? "apply" : "dry-run"} cards=${cards.length} r2Images=${keys.size} updates=${updates.length} unresolved=${unresolved.length}`,
  );

  if (unresolved.length > 0) {
    console.error(JSON.stringify({ unresolved }, null, 2));
    throw new Error("Some cards could not be matched to an R2 card image.");
  }

  if (!apply) {
    console.log(JSON.stringify({ sample: updates.slice(0, 10) }, null, 2));
    return;
  }

  for (const update of updates) {
    await prisma.card.update({
      where: { id: update.id },
      data: { imageUrl: update.imageUrl },
    });
  }

  console.log(`[r2:update-card-image-urls] updated ${updates.length} cards`);
};

main()
  .catch((error) => {
    console.error("[r2:update-card-image-urls]", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
