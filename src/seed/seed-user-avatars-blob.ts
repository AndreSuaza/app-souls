"use server";

import { prisma } from "../lib/prisma";

type AvatarMap = Record<string, string>;

const AVATAR_MAP: AvatarMap = {
  bostaurus:
    "souls/profile/avatars/bostaurus-60077844-b39a-409b-81eb-9d4e66a2bc2f.webp",
  dracula:
    "souls/profile/avatars/dracula-32ae75ec-8ac8-4804-a6a9-667b22dad2a8.webp",
  ekoar:
    "souls/profile/avatars/ekoar-17220109-cb75-4528-96fe-a5dffed8b38b.webp",
  eliathor:
    "souls/profile/avatars/eliathor-31bf9244-9ac0-4737-b4cb-0bfc813cdeb9.webp",
  erik: "souls/profile/avatars/erik-48100217-48c1-4330-ba68-3cc692b668f2.webp",
  estraker:
    "souls/profile/avatars/estraker-01e0df80-759c-4607-a4cf-578d3ee7b3b3.webp",
  fungido:
    "souls/profile/avatars/fungido-3c898701-7ce2-4609-980e-7944fb3f31b0.webp",
  "guardia-raton":
    "souls/profile/avatars/guardia-raton-aa9d9f37-8391-4114-8fd3-57dd656dd9d3.webp",
  kaerros:
    "souls/profile/avatars/kaerros-08ab5656-5232-4ae9-b8a4-5a6180eae9c6.webp",
  player:
    "souls/profile/avatars/player-89428902-dcb6-4ce0-ab1b-09153b55eb8f.webp",
  satiro:
    "souls/profile/avatars/satiro-d9f0d70d-7105-48a0-b24f-5a885c009355.webp",
  toro: "souls/profile/avatars/toro-1eed2c59-39b7-4670-a096-9fb54ed31d3d.webp",
  voluntad:
    "souls/profile/avatars/voluntad-dd0069ab-cc1b-4268-b0b5-508dd5117f62.webp",
};

async function main() {
  const operations: Array<{
    where: { image: string };
    data: { image: string };
  }> = [];

  for (const key in AVATAR_MAP) {
    if (!Object.prototype.hasOwnProperty.call(AVATAR_MAP, key)) continue;
    const pathname = AVATAR_MAP[key];
    operations.push({
      where: { image: key },
      data: { image: pathname },
    });
  }

  if (operations.length === 0) {
    console.log("[seed-user-avatars-blob] No hay avatares para actualizar.");
    return;
  }

  const result = await prisma.$transaction(
    operations.map((operation) => prisma.user.updateMany(operation)),
  );

  const updated = result.reduce((acc, item) => acc + item.count, 0);
  console.log(
    `[seed-user-avatars-blob] Avatares actualizados: ${updated} usuarios.`,
  );
}

const run = async () => {
  try {
    await main();
  } catch (error) {
    console.error("[seed-user-avatars-blob] Error:", error);
  } finally {
    await prisma.$disconnect();
  }
};

void run();
