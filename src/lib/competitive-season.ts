import type { Prisma } from "@prisma/client";

type SeasonClient = Prisma.TransactionClient;

export const getActiveCompetitiveSeason = async (client: SeasonClient) =>
  client.competitiveSeason.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { seasonNumber: "desc" },
  });

/** Garantiza un ciclo activo para las operaciones que generan estadísticas. */
export const ensureActiveCompetitiveSeason = async (
  client: SeasonClient,
  now = new Date(),
) => {
  const activeSeason = await getActiveCompetitiveSeason(client);
  if (activeSeason) return activeSeason;

  const latestSeason = await client.competitiveSeason.findFirst({
    orderBy: { seasonNumber: "desc" },
    select: { seasonNumber: true },
  });
  const seasonNumber = (latestSeason?.seasonNumber ?? 0) + 1;

  return client.competitiveSeason.create({
    data: {
      seasonNumber,
      name: `Temporada ${seasonNumber}`,
      status: "ACTIVE",
      startsAt: now,
      activatedAt: now,
    },
  });
};

export const startOfUtcDay = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

export const winrateFromStats = (eloPoints: number, matchesPlayed: number) =>
  matchesPlayed > 0
    ? Math.min(100, Math.max(0, Math.round((eloPoints / matchesPlayed) * 100)))
    : 0;
