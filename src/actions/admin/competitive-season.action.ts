"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  ensureActiveCompetitiveSeason,
  startOfUtcDay,
  winrateFromStats,
} from "@/lib/competitive-season";
import {
  CompetitiveSeasonCreateSchema,
  CompetitiveSeasonDashboardSchema,
  CompetitiveSeasonIdSchema,
  CompetitiveSeasonUpdateSchema,
} from "@/schemas";
import { getTopCutPvByPlayerId, isSwissStage, isTopCutTournamentType } from "@/logic";
import type { Prisma } from "@prisma/client";

const requireAdmin = async () => {
  const session = await auth();
  if (!session?.user?.idd || session.user.role !== "admin") {
    throw new Error("No tienes permisos para administrar temporadas.");
  }
  return { adminId: session.user.idd };
};

const dateToString = (value: Date | null | undefined) =>
  value ? value.toISOString() : null;

const mapSeason = (season: {
  id: string;
  seasonNumber: number;
  name: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "CLOSED";
  startsAt: Date | null;
  endsAt: Date | null;
  activatedAt: Date | null;
  closedAt: Date | null;
  isTransition: boolean;
  createdAt: Date;
}) => ({
  id: season.id,
  seasonNumber: season.seasonNumber,
  name: season.name,
  description: season.description,
  status: season.status,
  startsAt: dateToString(season.startsAt),
  endsAt: dateToString(season.endsAt),
  activatedAt: dateToString(season.activatedAt),
  closedAt: dateToString(season.closedAt),
  isTransition: season.isTransition,
  createdAt: season.createdAt.toISOString(),
});

const seasonSelect = {
  id: true,
  seasonNumber: true,
  name: true,
  description: true,
  status: true,
  startsAt: true,
  endsAt: true,
  activatedAt: true,
  closedAt: true,
  isTransition: true,
  createdAt: true,
} satisfies Prisma.CompetitiveSeasonSelect;

export const listCompetitiveSeasonsAction = async () => {
  await requireAdmin();
  const seasons = await prisma.competitiveSeason.findMany({
    select: seasonSelect,
    orderBy: { seasonNumber: "desc" },
  });
  return seasons.map(mapSeason);
};

export const createCompetitiveSeasonAction = async (input: unknown) => {
  const { adminId } = await requireAdmin();
  const parsed = CompetitiveSeasonCreateSchema.parse(input);
  const season = await prisma.$transaction(async (tx) => {
    const latest = await tx.competitiveSeason.findFirst({
      orderBy: { seasonNumber: "desc" },
      select: { seasonNumber: true },
    });
    const seasonNumber = Math.max(1, (latest?.seasonNumber ?? 0) + 1);
    return tx.competitiveSeason.create({
      data: {
        seasonNumber,
        name: parsed.name,
        description: parsed.description || null,
        startsAt: parsed.startsAt ?? null,
        endsAt: parsed.endsAt ?? null,
        createdById: adminId,
        status: "DRAFT",
      },
      select: seasonSelect,
    });
  });
  return { ok: true, season: mapSeason(season) };
};

export const updateCompetitiveSeasonAction = async (input: unknown) => {
  await requireAdmin();
  const parsed = CompetitiveSeasonUpdateSchema.parse(input);
  const existing = await prisma.competitiveSeason.findUnique({
    where: { id: parsed.seasonId },
    select: { status: true },
  });
  if (!existing) throw new Error("Temporada no encontrada.");
  if (existing.status === "CLOSED") {
    throw new Error("Las temporadas cerradas son inmutables.");
  }
  const season = await prisma.competitiveSeason.update({
    where: { id: parsed.seasonId },
    data: {
      name: parsed.name,
      description: parsed.description || null,
      startsAt: parsed.startsAt ?? null,
      endsAt: parsed.endsAt ?? null,
    },
    select: seasonSelect,
  });
  return { ok: true, season: mapSeason(season) };
};

export const activateCompetitiveSeasonAction = async (input: unknown) => {
  await requireAdmin();
  const { seasonId } = CompetitiveSeasonIdSchema.parse(input);
  const season = await prisma.$transaction(async (tx) => {
    const target = await tx.competitiveSeason.findUnique({
      where: { id: seasonId },
      select: { id: true, seasonNumber: true, status: true, isTransition: true },
    });
    if (!target) throw new Error("Temporada no encontrada.");
    if (target.isTransition || target.status !== "DRAFT") {
      throw new Error("Solo puedes activar una temporada en borrador.");
    }
    const active = await tx.competitiveSeason.findFirst({
      where: { status: "ACTIVE" },
      select: { id: true },
    });
    if (active) throw new Error("Ya existe una temporada activa. Ciérrala antes de activar otra.");
    return tx.competitiveSeason.update({
      where: { id: seasonId },
      data: {
        status: "ACTIVE",
        startsAt: new Date(),
        activatedAt: new Date(),
      },
      select: seasonSelect,
    });
  });
  return { ok: true, season: mapSeason(season) };
};

type SeasonUser = {
  id: string;
  nickname: string;
  name: string | null;
  lastname: string | null;
  eloPoints: number;
  victoryPoints: number;
  matchesPlayed: number;
  tournamentsPlayed: number;
};

const rankUsers = (users: SeasonUser[]) => {
  const byElo = [...users].sort((a, b) => b.eloPoints - a.eloPoints || b.victoryPoints - a.victoryPoints || a.nickname.localeCompare(b.nickname));
  const byPv = [...users].sort((a, b) => b.victoryPoints - a.victoryPoints || b.eloPoints - a.eloPoints || a.nickname.localeCompare(b.nickname));
  const eloRanks = new Map(byElo.map((user, index) => [user.id, index + 1]));
  const pvRanks = new Map(byPv.map((user, index) => [user.id, index + 1]));
  return users.map((user) => ({
    ...user,
    eloRank: eloRanks.get(user.id) ?? null,
    victoryPointsRank: pvRanks.get(user.id) ?? null,
    winrate: winrateFromStats(user.eloPoints, user.matchesPlayed),
  }));
};

const buildSeasonMetrics = async (
  tx: Prisma.TransactionClient,
  seasonId: string,
  now: Date,
) => {
  const [tournaments, claims, adjustments, purchases] = await Promise.all([
    tx.tournament.findMany({
      where: { competitiveSeasonId: seasonId },
      select: {
        id: true,
        date: true,
        status: true,
        storeId: true,
        store: { select: { id: true, name: true, city: true } },
        tournamentPlayers: { select: { userId: true } },
        typeTournament: { select: { name: true } },
        tournamentRounds: {
          select: {
            stage: true,
            matches: { select: { player1Id: true, player2Id: true, result: true } },
          },
        },
      },
    }),
    tx.battlePassClaim.findMany({
      where: { competitiveSeasonId: seasonId },
      select: { claimedAt: true, victoryPointsAwarded: true },
    }),
    tx.victoryPointAdjustment.findMany({
      where: { competitiveSeasonId: seasonId },
      select: { createdAt: true, amount: true },
    }),
    tx.avatarPurchase.findMany({
      where: { competitiveSeasonId: seasonId },
      select: { createdAt: true, pricePaid: true },
    }),
  ]);

  const daily = new Map<string, { date: Date; tournaments: number; matches: number; activePlayers: Set<string>; pvAwarded: number; pvAdjusted: number; pvSpent: number }>();
  const stores = new Map<string, { storeId: string; storeName: string; city: string; tournaments: number; matches: number; players: Set<string>; pvAwarded: number }>();
  const getDaily = (date: Date) => {
    const day = startOfUtcDay(date);
    const key = day.toISOString();
    const current = daily.get(key) ?? { date: day, tournaments: 0, matches: 0, activePlayers: new Set<string>(), pvAwarded: 0, pvAdjusted: 0, pvSpent: 0 };
    daily.set(key, current);
    return current;
  };
  for (const tournament of tournaments) {
    if (tournament.status !== "finished") continue;
    const metric = getDaily(tournament.date);
    metric.tournaments += 1;
    const store = stores.get(tournament.storeId) ?? { storeId: tournament.storeId, storeName: tournament.store.name, city: tournament.store.city, tournaments: 0, matches: 0, players: new Set<string>(), pvAwarded: 0 };
    store.tournaments += 1;
    for (const player of tournament.tournamentPlayers) {
      metric.activePlayers.add(player.userId);
      store.players.add(player.userId);
    }
    let tournamentPv = 0;
    for (const round of tournament.tournamentRounds) {
      metric.matches += round.matches.length;
      store.matches += round.matches.length;
      for (const match of round.matches) {
        if (match.result === "P1" || match.result === "P2") tournamentPv += 1;
      }
    }
    if (isTopCutTournamentType(tournament.typeTournament.name)) {
      try {
        const topCut = getTopCutPvByPlayerId(tournament.tournamentRounds.filter((round) => !isSwissStage(round.stage)));
        tournamentPv += Array.from(topCut.values()).reduce((sum, value) => sum + value, 0);
      } catch {
        // Un bracket incompleto no debe impedir cerrar una temporada ya existente.
      }
    }
    metric.pvAwarded += tournamentPv;
    store.pvAwarded += tournamentPv;
    stores.set(tournament.storeId, store);
  }
  for (const claim of claims) {
    getDaily(claim.claimedAt).pvAwarded += claim.victoryPointsAwarded ?? 0;
  }
  for (const adjustment of adjustments) {
    getDaily(adjustment.createdAt).pvAdjusted += adjustment.amount;
  }
  for (const purchase of purchases) {
    getDaily(purchase.createdAt).pvSpent += purchase.pricePaid;
  }
  await tx.competitiveSeasonDailyMetric.createMany({
    data: Array.from(daily.values()).map((metric) => ({
      seasonId,
      date: metric.date,
      tournaments: metric.tournaments,
      matches: metric.matches,
      activePlayers: metric.activePlayers.size,
      pvAwarded: metric.pvAwarded,
      pvAdjusted: metric.pvAdjusted,
      pvSpent: metric.pvSpent,
    })),
  });
  await tx.competitiveSeasonStoreMetric.createMany({
    data: Array.from(stores.values()).map((store) => ({
      seasonId,
      storeId: store.storeId,
      storeName: store.storeName,
      city: store.city,
      tournaments: store.tournaments,
      matches: store.matches,
      uniquePlayers: store.players.size,
      pvAwarded: store.pvAwarded,
    })),
  });
  return { generatedAt: now.toISOString() };
};

export const closeCompetitiveSeasonAction = async (input: unknown) => {
  const { adminId } = await requireAdmin();
  const { seasonId } = CompetitiveSeasonIdSchema.parse(input);
  const season = await prisma.$transaction(async (tx) => {
    const target = await tx.competitiveSeason.findUnique({
      where: { id: seasonId },
      select: { id: true, seasonNumber: true, status: true, isTransition: true },
    });
    if (!target) throw new Error("Temporada no encontrada.");
    if (target.isTransition || target.status !== "ACTIVE") throw new Error("Solo puedes cerrar la temporada activa.");
    const now = new Date();
    const users = await tx.user.findMany({
      where: { role: "player" },
      select: { id: true, nickname: true, name: true, lastname: true, eloPoints: true, victoryPoints: true, matchesPlayed: true, tournamentsPlayed: true },
    });
    const ranked = rankUsers(users);
    await tx.competitiveSeasonPlayerSnapshot.createMany({
      data: ranked.map((user) => ({
        seasonId,
        userId: user.id,
        nickname: user.nickname,
        name: user.name,
        lastname: user.lastname,
        eloPoints: user.eloPoints,
        victoryPoints: user.victoryPoints,
        matchesPlayed: user.matchesPlayed,
        tournamentsPlayed: user.tournamentsPlayed,
        winrate: user.winrate,
        eloRank: user.eloRank,
        victoryPointsRank: user.victoryPointsRank,
      })),
    });
    // Conserva también el histórico legado que todavía consume la tienda de cosméticos.
    await tx.eloSeasonHistory.createMany({
      data: ranked.map((user) => ({
        userId: user.id,
        eloPoints: user.eloPoints,
        matchesPlayed: user.matchesPlayed,
        winrate: user.winrate,
        seasonNumber: target.seasonNumber,
      })),
    });
    await buildSeasonMetrics(tx, seasonId, now);
    await tx.user.updateMany({ where: { role: "player" }, data: { eloPoints: 0, victoryPoints: 0, matchesPlayed: 0, tournamentsPlayed: 0 } });
    return tx.competitiveSeason.update({
      where: { id: seasonId },
      data: { status: "CLOSED", closedAt: now, endsAt: now, closedById: adminId },
      select: seasonSelect,
    });
  });
  return { ok: true, season: mapSeason(season) };
};

export const restartCompetitiveSeasonAction = async (input: unknown) => {
  const { seasonId } = CompetitiveSeasonIdSchema.parse(input);
  await closeCompetitiveSeasonAction({ seasonId });
  return createCompetitiveSeasonAction({ name: "Nueva temporada", description: "Temporada creada después del cierre anterior." });
};

export const createTransitionSeasonAction = async () => {
  const { adminId } = await requireAdmin();
  const existing = await prisma.competitiveSeason.findFirst({ where: { isTransition: true }, select: { id: true } });
  if (existing) throw new Error("La temporada de transición ya existe.");
  const season = await prisma.$transaction(async (tx) => {
    const created = await tx.competitiveSeason.create({
      data: { seasonNumber: 0, name: "Histórico previo", description: "Snapshot de los datos anteriores al módulo de temporadas.", status: "CLOSED", isTransition: true, closedAt: new Date(), closedById: adminId },
      select: { id: true },
    });
    // Los registros existentes se conservan y quedan atribuidos al histórico
    // previo para que el dashboard no pierda la actividad ya realizada.
    await tx.tournament.updateMany({ where: { competitiveSeasonId: { isSet: false } }, data: { competitiveSeasonId: created.id } });
    await tx.battlePassClaim.updateMany({ where: { competitiveSeasonId: { isSet: false } }, data: { competitiveSeasonId: created.id } });
    await tx.victoryPointAdjustment.updateMany({ where: { competitiveSeasonId: { isSet: false } }, data: { competitiveSeasonId: created.id } });
    await tx.avatarPurchase.updateMany({ where: { competitiveSeasonId: { isSet: false } }, data: { competitiveSeasonId: created.id } });
    const users = await tx.user.findMany({ where: { role: "player" }, select: { id: true, nickname: true, name: true, lastname: true, eloPoints: true, victoryPoints: true, matchesPlayed: true, tournamentsPlayed: true } });
    const ranked = rankUsers(users);
    await tx.competitiveSeasonPlayerSnapshot.createMany({ data: ranked.map((user) => ({ seasonId: created.id, userId: user.id, nickname: user.nickname, name: user.name, lastname: user.lastname, eloPoints: user.eloPoints, victoryPoints: user.victoryPoints, matchesPlayed: user.matchesPlayed, tournamentsPlayed: user.tournamentsPlayed, winrate: user.winrate, eloRank: user.eloRank, victoryPointsRank: user.victoryPointsRank })) });
    await buildSeasonMetrics(tx, created.id, new Date());
    return tx.competitiveSeason.findUniqueOrThrow({ where: { id: created.id }, select: seasonSelect });
  });
  return { ok: true, season: mapSeason(season) };
};

export type CompetitiveSeasonDashboard = Awaited<ReturnType<typeof getCompetitiveSeasonDashboardAction>>;

export const getCompetitiveSeasonDashboardAction = async (input: unknown) => {
  await requireAdmin();
  const parsed = CompetitiveSeasonDashboardSchema.parse(input);
  const seasonId = parsed.seasonId;
  const page = parsed.page ?? 1;
  const pageSize = parsed.pageSize ?? 10;
  const skip = (page - 1) * pageSize;
  const season = await prisma.competitiveSeason.findUnique({ where: { id: seasonId }, select: seasonSelect });
  if (!season) throw new Error("Temporada no encontrada.");
  const isHistorical = season.status === "CLOSED";
  const tournamentWhere = { competitiveSeasonId: seasonId };
  const [snapshots, users, tournaments, tournamentCount, tournamentMetrics, daily, stores, claims, adjustments, purchases] = await Promise.all([
    prisma.competitiveSeasonPlayerSnapshot.findMany({ where: { seasonId }, orderBy: { eloRank: "asc" } }),
    isHistorical ? Promise.resolve([]) : prisma.user.findMany({ where: { role: "player" }, select: { id: true, nickname: true, name: true, lastname: true, eloPoints: true, victoryPoints: true, matchesPlayed: true, tournamentsPlayed: true } }),
    prisma.tournament.findMany({ where: tournamentWhere, select: { id: true, title: true, date: true, status: true, store: { select: { name: true, city: true } }, tournamentPlayers: { select: { userId: true } }, tournamentRounds: { select: { matches: { select: { id: true } } } } }, orderBy: { date: "desc" }, skip, take: pageSize }),
    prisma.tournament.count({ where: tournamentWhere }),
    prisma.tournament.findMany({ where: tournamentWhere, select: { date: true, status: true, store: { select: { name: true, city: true } }, tournamentPlayers: { select: { userId: true } }, tournamentRounds: { select: { matches: { select: { result: true } } } } } }),
    prisma.competitiveSeasonDailyMetric.findMany({ where: { seasonId }, orderBy: { date: "asc" } }),
    prisma.competitiveSeasonStoreMetric.findMany({ where: { seasonId }, orderBy: { tournaments: "desc" }, take: 12 }),
    prisma.battlePassClaim.aggregate({ where: { competitiveSeasonId: seasonId }, _sum: { victoryPointsAwarded: true } }),
    prisma.victoryPointAdjustment.aggregate({ where: { competitiveSeasonId: seasonId }, _sum: { amount: true } }),
    prisma.avatarPurchase.aggregate({ where: { competitiveSeasonId: seasonId }, _sum: { pricePaid: true } }),
  ]);
  const ranked = isHistorical ? snapshots.map((snapshot) => ({ id: snapshot.userId, nickname: snapshot.nickname, name: snapshot.name, lastname: snapshot.lastname, eloPoints: snapshot.eloPoints, victoryPoints: snapshot.victoryPoints, matchesPlayed: snapshot.matchesPlayed, tournamentsPlayed: snapshot.tournamentsPlayed, winrate: snapshot.winrate, eloRank: snapshot.eloRank, victoryPointsRank: snapshot.victoryPointsRank })) : rankUsers(users);
  const totalMatches = daily.length > 0
    ? daily.reduce((sum, metric) => sum + metric.matches, 0)
    : tournamentMetrics.reduce((total, tournament) => total + tournament.tournamentRounds.reduce((sum, round) => sum + round.matches.length, 0), 0);
  const totalTournaments = daily.length > 0
    ? daily.reduce((sum, metric) => sum + metric.tournaments, 0)
    : tournamentMetrics.filter((tournament) => tournament.status === "finished").length;
  const tournamentPv = tournamentMetrics.reduce((total, tournament) => total + tournament.tournamentRounds.reduce((sum, round) => sum + round.matches.filter((match) => match.result === "P1" || match.result === "P2").length, 0), 0);
  const pvAwarded = daily.length > 0
    ? daily.reduce((sum, metric) => sum + metric.pvAwarded, 0)
    : (claims._sum.victoryPointsAwarded ?? 0) + tournamentPv;
  const liveStores = new Map<string, { storeName: string; city: string; tournaments: number; matches: number; uniquePlayers: Set<string> }>();
  for (const tournament of tournamentMetrics) {
    const key = `${tournament.store.name}-${tournament.store.city}`;
    const store = liveStores.get(key) ?? { storeName: tournament.store.name, city: tournament.store.city, tournaments: 0, matches: 0, uniquePlayers: new Set<string>() };
    store.tournaments += tournament.status === "finished" ? 1 : 0;
    store.matches += tournament.tournamentRounds.reduce((sum, round) => sum + round.matches.length, 0);
    tournament.tournamentPlayers.forEach((player) => store.uniquePlayers.add(player.userId));
    liveStores.set(key, store);
  }
  const storeRows = stores.length > 0
    ? stores.map((store) => ({ storeName: store.storeName, city: store.city, tournaments: store.tournaments, matches: store.matches, uniquePlayers: store.uniquePlayers, pvAwarded: store.pvAwarded }))
    : Array.from(liveStores.values()).map((store) => ({ ...store, uniquePlayers: store.uniquePlayers.size, pvAwarded: 0 }));
  const liveDaily = new Map<string, { date: Date; tournaments: number; matches: number; activePlayers: Set<string> }>();
  for (const tournament of tournamentMetrics) {
    if (tournament.status !== "finished") continue;
    const date = startOfUtcDay(tournament.date);
    const key = date.toISOString();
    const metric = liveDaily.get(key) ?? { date, tournaments: 0, matches: 0, activePlayers: new Set<string>() };
    metric.tournaments += 1;
    metric.matches += tournament.tournamentRounds.reduce((sum, round) => sum + round.matches.length, 0);
    tournament.tournamentPlayers.forEach((player) => metric.activePlayers.add(player.userId));
    liveDaily.set(key, metric);
  }
  const dailyRows = daily.length > 0
    ? daily.map((metric) => ({ date: metric.date.toISOString(), tournaments: metric.tournaments, matches: metric.matches, activePlayers: metric.activePlayers, pvAwarded: metric.pvAwarded, pvAdjusted: metric.pvAdjusted, pvSpent: metric.pvSpent }))
    : Array.from(liveDaily.values()).map((metric) => ({ date: metric.date.toISOString(), tournaments: metric.tournaments, matches: metric.matches, activePlayers: metric.activePlayers.size, pvAwarded: 0, pvAdjusted: 0, pvSpent: 0 }));
  return {
    updatedAt: new Date().toISOString(),
    season: mapSeason(season),
    kpis: {
      players: ranked.length,
      tournaments: totalTournaments,
      matches: totalMatches,
      pvAwarded,
      pvAdjusted: adjustments._sum.amount ?? 0,
      pvSpent: purchases._sum.pricePaid ?? 0,
    },
    topPlayers: ranked.slice().sort((a, b) => b.eloPoints - a.eloPoints).slice(0, 10),
    topPvPlayers: ranked.slice().sort((a, b) => b.victoryPoints - a.victoryPoints).slice(0, 10),
    tournaments: tournaments.map((tournament) => ({ id: tournament.id, title: tournament.title, date: tournament.date.toISOString(), status: tournament.status, store: tournament.store, players: tournament.tournamentPlayers.length, matches: tournament.tournamentRounds.reduce((sum, round) => sum + round.matches.length, 0) })),
    tournamentPagination: { page, pageSize, total: tournamentCount, totalPages: Math.max(1, Math.ceil(tournamentCount / pageSize)) },
    daily: dailyRows,
    stores: storeRows,
  };
};

export const ensureCompetitiveSeasonForActivity = async (tx: Prisma.TransactionClient) => ensureActiveCompetitiveSeason(tx);
