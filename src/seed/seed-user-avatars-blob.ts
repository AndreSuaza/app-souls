"use server";

import { prisma } from "../lib/prisma";

type AvatarMap = Record<string, string>;

const AVATAR_MAP: AvatarMap = {
  bostaurus:
    "souls/profile/avatars/bostaurus-43540c2f-da5d-4003-bcbb-cf72d57a9db4.webp",
  dracula:
    "souls/profile/avatars/dracula-14bb6f2f-b3f3-4853-aeb9-2b6da7a43f5a.webp",
  ekoar:
    "souls/profile/avatars/ekoar-1522694d-23fb-49d8-b14b-e520bcf683fe.webp",
  eliathor:
    "souls/profile/avatars/eliathor-75da344b-02f1-4be9-b9a6-097dde091da3.webp",
  erik: "souls/profile/avatars/erik-308d62e2-b920-4b79-95a4-b2d710261976.webp",
  estraker:
    "souls/profile/avatars/estraker-a8b8c7a6-07b2-4a42-9f3c-f20e56a8b609.webp",
  fungido:
    "souls/profile/avatars/fungido-d7ed3adf-b924-4f78-a8da-318a74265620.webp",
  "guardia-raton":
    "souls/profile/avatars/guardia-raton-1d024a4a-1f24-48e3-bf9c-5baa5c39b733.webp",
  kaerros:
    "souls/profile/avatars/kaerros-6565e182-6897-4e2e-a9e9-1e05a56c6056.webp",
  player:
    "souls/profile/avatars/player-5ea416fa-7d77-4f42-bb2d-c7920bd3c8d4.webp",
  satiro:
    "souls/profile/avatars/satiro-b1876299-14ad-4a0e-9075-dcecb63198b7.webp",
  toro: "souls/profile/avatars/toro-f7568a89-4bf8-4a30-94b1-0b537fbf0ee3.webp",
  voluntad:
    "souls/profile/avatars/voluntad-692530e6-3d0d-4f39-93b7-a1e65aa6ce98.webp",
};
const DEFAULT_BANNER =
  "souls/profile/banners/angel-ac15be76-16b4-4f45-a5c0-fb30655a89a0.webp";

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
