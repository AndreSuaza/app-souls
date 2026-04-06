"use server";

import { prisma } from "../lib/prisma";

type AvatarMap = Record<string, string>;

const AVATAR_MAP: AvatarMap = {
  bostaurus:
    "souls/profile/avatars/bostaurus-ecadd2b6-542e-46ab-b800-04903e4d9391.webp",
  dracula:
    "souls/profile/avatars/dracula-4f8850fe-295d-4af6-be4d-a4ac7d088064.webp",
  ekoar:
    "souls/profile/avatars/ekoar-01d310c6-9034-4747-b295-a2f1b8a9d236.webp",
  eliathor:
    "souls/profile/avatars/eliathor-8c5fd1a9-03a6-463e-83df-88adb938e795.webp",
  erik: "souls/profile/avatars/erik-e9e3861b-6c2b-478d-b057-abf8f3ba01c5.webp",
  estraker:
    "souls/profile/avatars/estraker-6bc1dd43-4040-4937-a20c-215a4832a1fe.webp",
  fungido:
    "souls/profile/avatars/fungido-bdb66691-58df-49d9-b5ab-edf08a62d37b.webp",
  "guardia-raton":
    "souls/profile/avatars/guardia-raton-22a311df-94f9-4eb2-ac94-ee418c5f06a3.webp",
  kaerros:
    "souls/profile/avatars/kaerros-7560fa59-3508-487a-bf32-36afe00d6c71.webp",
  player:
    "souls/profile/avatars/player-f2fea397-2187-4000-b3da-55ef33376457.webp",
  satiro:
    "souls/profile/avatars/satiro-69fc7f39-d337-4503-adff-b54b945c6d3b.webp",
  toro: "souls/profile/avatars/toro-797cceb4-0222-4c11-91a0-e5c4875c2cc3.webp",
  voluntad:
    "souls/profile/avatars/voluntad-42dd3f84-8cf3-4138-a8c1-c2c8103a9954.webp",
};
const DEFAULT_BANNER =
  "souls/profile/banners/angel-82ca9604-cf1a-41a4-8240-7f9092720280.webp";

async function main() {
  // Actualiza usuarios y jugadores de torneo que aun tengan avatares legacy.
  const userOperations: Array<{
    where: { image: string };
    data: { image: string };
  }> = [];
  const tournamentPlayerOperations: Array<{
    where: { image: string };
    data: { image: string };
  }> = [];

  for (const key in AVATAR_MAP) {
    if (!Object.prototype.hasOwnProperty.call(AVATAR_MAP, key)) continue;
    const pathname = AVATAR_MAP[key];
    userOperations.push({
      where: { image: key },
      data: { image: pathname },
    });
    tournamentPlayerOperations.push({
      where: { image: key },
      data: { image: pathname },
    });
  }

  let updatedUsers = 0;
  let updatedTournamentPlayers = 0;

  if (userOperations.length > 0) {
    const [userResult, tournamentPlayerResult] = await Promise.all([
      prisma.$transaction(
        userOperations.map((operation) => prisma.user.updateMany(operation)),
      ),
      prisma.$transaction(
        tournamentPlayerOperations.map((operation) =>
          prisma.tournamentPlayer.updateMany(operation),
        ),
      ),
    ]);

    updatedUsers = userResult.reduce((acc, item) => acc + item.count, 0);
    updatedTournamentPlayers = tournamentPlayerResult.reduce(
      (acc, item) => acc + item.count,
      0,
    );
  } else {
    console.log("[seed-user-avatars-blob] No hay avatares para actualizar.");
  }
  const bannerResult = await prisma.user.updateMany({
    where: {
      OR: [
        { bannerImage: { isSet: false } },
        { bannerImage: null },
        { bannerImage: "" },
      ],
    },
    data: {
      bannerImage: DEFAULT_BANNER,
    },
  });
  console.log(
    `[seed-user-avatars-blob] Avatares actualizados: ${updatedUsers} usuarios.`,
  );
  console.log(
    `[seed-user-avatars-blob] Avatares actualizados en torneos: ${updatedTournamentPlayers} jugadores.`,
  );
  console.log(
    `[seed-user-avatars-blob] Banners por defecto asignados: ${bannerResult.count} usuarios.`,
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
