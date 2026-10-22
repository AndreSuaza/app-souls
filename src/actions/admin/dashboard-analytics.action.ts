"use server";

import { auth } from "@/auth";
import {
  addToDateMap,
  buildDateSeries,
  percentageChange,
  resolveDashboardPeriod,
} from "@/logic/admin-dashboard";
import { prisma } from "@/lib/prisma";
import {
  AdminDashboardFiltersSchema,
  type AdminDashboardFilters,
} from "@/schemas";
import { Prisma, TournamentFormat, TournamentStatus } from "@prisma/client";

type DashboardInput = Partial<AdminDashboardFilters> | undefined;

export type DashboardKpi = {
  label: string;
  value: number;
  previousValue?: number;
  change?: number;
  suffix?: string;
};

export type DashboardSeriesPoint = {
  date: string;
  label: string;
  value: number;
  players?: number;
};

export type AppDashboardData = {
  period: { from: string; to: string; previousFrom: string; previousTo: string };
  updatedAt: string;
  kpis: DashboardKpi[];
  usersSeries: DashboardSeriesPoint[];
  tournamentsByStatus: Array<{ name: string; value: number; color: string }>;
  uniquePlayersByStore: Array<{ name: string; value: number; color?: string }>;
  activityByModule: Array<{ name: string; value: number; color: string }>;
  simulatorSeries: DashboardSeriesPoint[];
  alerts: Array<{ title: string; description: string; severity: "info" | "warning" | "critical" }>;
};

export type TournamentDashboardData = {
  period: AppDashboardData["period"];
  updatedAt: string;
  kpis: DashboardKpi[];
  createdSeries: DashboardSeriesPoint[];
  averagePlayersSeries: DashboardSeriesPoint[];
  statusBreakdown: Array<{ name: string; value: number; color: string }>;
  formatBreakdown: Array<{ name: string; value: number; color?: string }>;
};

export type UserDashboardData = {
  period: AppDashboardData["period"];
  updatedAt: string;
  kpis: DashboardKpi[];
  registrationsSeries: DashboardSeriesPoint[];
  roleBreakdown: Array<{ name: string; value: number; color?: string }>;
  statusBreakdown: Array<{ name: string; value: number; color?: string }>;
  activityBreakdown: Array<{ name: string; value: number; color: string }>;
};

export type SimulatorDashboardData = {
  available: boolean;
  updatedAt: string;
  error?: string;
  kpis: DashboardKpi[];
  matchesSeries: DashboardSeriesPoint[];
  concurrencySeries: DashboardSeriesPoint[];
  completionByMode: Array<{ name: string; value: number }>;
  durationByMode: Array<{ name: string; value: number }>;
};

const requireAdmin = async () => {
  const session = await auth();
  if (!session?.user?.idd || session.user.role !== "admin") {
    throw new Error("No tienes permisos para consultar analítica administrativa.");
  }
};

const parseInput = (input: DashboardInput) =>
  AdminDashboardFiltersSchema.parse(input ?? {});

const periodDto = (period: ReturnType<typeof resolveDashboardPeriod>) => ({
  from: period.from.toISOString(),
  to: period.to.toISOString(),
  previousFrom: period.previousFrom.toISOString(),
  previousTo: period.previousTo.toISOString(),
});

const statusLabels: Record<string, string> = {
  pending: "Pendientes",
  in_progress: "En curso",
  finished: "Finalizados",
  cancelled: "Cancelados",
};

const statusColors: Record<string, string> = {
  pending: "#a78bfa",
  in_progress: "#f59e0b",
  finished: "#22c55e",
  cancelled: "#ef4444",
};

const buildTournamentWhere = (
  filters: AdminDashboardFilters,
  from: Date,
  to: Date,
): Prisma.TournamentWhereInput => ({
  createDate: { gte: from, lte: to },
  ...(filters.storeId ? { storeId: filters.storeId } : {}),
  ...(filters.format && filters.format !== "all" ? { format: filters.format } : {}),
  ...(filters.status && filters.status !== "all" ? { status: filters.status } : {}),
});

const buildUserWhere = (filters: AdminDashboardFilters): Prisma.UserWhereInput => ({
  ...(filters.storeId ? { storeId: filters.storeId } : {}),
  ...(filters.role && filters.role !== "all" ? { role: filters.role } : {}),
  ...(filters.userStatus && filters.userStatus !== "all" ? { status: filters.userStatus } : {}),
});

const getActiveUserIds = async (
  from: Date,
  to: Date,
  filters: AdminDashboardFilters,
) => {
  const scopedUsers = filters.storeId
    ? await prisma.user.findMany({ where: { storeId: filters.storeId }, select: { id: true } })
    : null;
  const allowedIds = scopedUsers ? new Set(scopedUsers.map(({ id }) => id)) : null;
  const [tournaments, decks, likes, rewards, purchases, simulator] = await Promise.all([
    prisma.tournamentPlayer.findMany({ where: { createDate: { gte: from, lte: to } }, select: { userId: true } }),
    prisma.deck.findMany({ where: { createdAt: { gte: from, lte: to } }, select: { userId: true } }),
    prisma.like.findMany({ where: { createdAt: { gte: from, lte: to } }, select: { userId: true } }),
    prisma.battlePassClaim.findMany({ where: { claimedAt: { gte: from, lte: to } }, select: { userId: true } }),
    prisma.avatarPurchase.findMany({ where: { createdAt: { gte: from, lte: to } }, select: { userId: true } }),
    prisma.simulatorOAuthExchange.findMany({ where: { createdAt: { gte: from, lte: to } }, select: { userId: true } }),
  ]);
  const ids = new Set<string>();
  [...tournaments, ...decks, ...likes, ...rewards, ...purchases, ...simulator].forEach(({ userId }) => {
    if (!allowedIds || allowedIds.has(userId)) ids.add(userId);
  });
  return [...ids];
};

const countNewUsers = async (filters: AdminDashboardFilters, from: Date, to: Date) =>
  prisma.user.count({ where: { ...buildUserWhere(filters), createdAt: { gte: from, lte: to } } });

const countUsersWithActivity = async (
  filters: AdminDashboardFilters,
  from: Date,
  to: Date,
) => {
  const ids = await getActiveUserIds(from, to, filters);
  if (ids.length === 0) return 0;
  return prisma.user.count({ where: { ...buildUserWhere(filters), id: { in: ids } } });
};

const getUniquePlayersByStore = async (
  filters: AdminDashboardFilters,
  from: Date,
  to: Date,
) => {
  const tournaments = await prisma.tournament.findMany({
    where: {
      date: { gte: from, lte: to },
      status: { in: [TournamentStatus.in_progress, TournamentStatus.finished] },
      ...(filters.storeId ? { storeId: filters.storeId } : {}),
    },
    select: {
      storeId: true,
      store: { select: { name: true } },
      tournamentPlayers: { select: { userId: true } },
    },
  });
  const playersByStore = new Map<string, { name: string; players: Set<string> }>();

  tournaments.forEach((tournament) => {
    const report = playersByStore.get(tournament.storeId) ?? {
      name: tournament.store.name,
      players: new Set<string>(),
    };
    tournament.tournamentPlayers.forEach(({ userId }) => report.players.add(userId));
    playersByStore.set(tournament.storeId, report);
  });

  return [...playersByStore.values()]
    .map(({ name, players }) => ({ name, value: players.size }))
    .sort((left, right) => right.value - left.value || left.name.localeCompare(right.name));
};

const getSimulatorReport = async (input: AdminDashboardFilters): Promise<SimulatorDashboardData> => {
  const base = {
    from: input.from,
    to: input.to,
    mode: input.mode,
    matchMode: input.matchMode,
    status: input.simulatorStatus,
  };
  const url = process.env.SIMULATOR_ADMIN_API_URL?.trim();
  const token = process.env.SIMULATOR_ADMIN_API_TOKEN?.trim();
  if (!url || !token) {
    return {
      available: false,
      updatedAt: new Date().toISOString(),
      error: "El API administrativo del simulador no está configurado.",
      kpis: [],
      matchesSeries: [],
      concurrencySeries: [],
      completionByMode: [],
      durationByMode: [],
    };
  }

  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/admin/reports/overview`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
      method: "POST",
      body: JSON.stringify(base),
    });
    if (!response.ok) throw new Error(`El simulador respondió ${response.status}.`);
    return (await response.json()) as SimulatorDashboardData;
  } catch (error) {
    return {
      available: false,
      updatedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "No se pudo consultar el simulador.",
      kpis: [],
      matchesSeries: [],
      concurrencySeries: [],
      completionByMode: [],
      durationByMode: [],
    };
  }
};

export const getAdminDashboardAction = async (input?: DashboardInput): Promise<AppDashboardData> => {
  await requireAdmin();
  const filters = parseInput(input);
  const period = resolveDashboardPeriod(filters);
  const userWhere = buildUserWhere(filters);
  const tournamentWhere = buildTournamentWhere(filters, period.from, period.to);
  const [totalUsers, newUsers, previousNewUsers, activeUsers, activeTournaments, finishedTournaments, statusCounts, simulator, userDates, pendingRounds, overdueTournaments, uniquePlayersByStore] = await Promise.all([
    prisma.user.count({ where: userWhere }),
    countNewUsers(filters, period.from, period.to),
    countNewUsers(filters, period.previousFrom, period.previousTo),
    countUsersWithActivity(filters, period.from, period.to),
    prisma.tournament.count({ where: { ...tournamentWhere, status: "in_progress" } }),
    prisma.tournament.count({ where: { ...tournamentWhere, status: "finished" } }),
    Promise.all((Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map(async (status) => ({
      name: statusLabels[status],
      value: await prisma.tournament.count({ where: { ...tournamentWhere, status: status as TournamentStatus } }),
      color: statusColors[status],
    }))),
    getSimulatorReport({ ...filters, from: period.fromKey, to: period.toKey }),
    prisma.user.findMany({ where: { ...userWhere, createdAt: { gte: period.from, lte: period.to } }, select: { createdAt: true } }),
    prisma.round.count({ where: { startedAt: { not: null }, finishedAt: null, tournament: { status: "in_progress" } } }),
    prisma.tournament.count({ where: { status: "pending", date: { lt: new Date() } } }),
    getUniquePlayersByStore(filters, period.from, period.to),
  ]);
  const userDateMap = new Map<string, number>();
  userDates.forEach(({ createdAt }) => addToDateMap(userDateMap, createdAt));
  const simulatorSeries = simulator.matchesSeries;

  return {
    period: periodDto(period),
    updatedAt: new Date().toISOString(),
    kpis: [
      { label: "Usuarios totales", value: totalUsers },
      { label: "Nuevos usuarios", value: newUsers, previousValue: previousNewUsers, change: percentageChange(newUsers, previousNewUsers) },
      { label: "Usuarios con actividad", value: activeUsers },
      { label: "Torneos activos", value: activeTournaments },
      { label: "Partidas activas", value: simulator.available ? simulator.kpis.find((item) => item.label === "Partidas activas")?.value ?? 0 : 0 },
      { label: "Torneos finalizados", value: finishedTournaments },
    ],
    usersSeries: buildDateSeries(period, userDateMap),
    tournamentsByStatus: statusCounts,
    uniquePlayersByStore,
    activityByModule: [
      { name: "Usuarios", value: activeUsers, color: "#a855f7" },
      { name: "Torneos", value: activeTournaments + finishedTournaments, color: "#f59e0b" },
      { name: "Simulador", value: simulator.kpis.find((item) => item.label === "Partidas finalizadas")?.value ?? 0, color: "#22c55e" },
    ],
    simulatorSeries,
    alerts: [
      ...(pendingRounds > 0 ? [{ title: "Rondas pendientes", description: `${pendingRounds} ronda${pendingRounds === 1 ? "" : "s"} iniciada${pendingRounds === 1 ? "" : "s"} aún no ha${pendingRounds === 1 ? "" : "n"} sido finalizada${pendingRounds === 1 ? "" : "s"}.`, severity: "warning" as const }] : []),
      ...(overdueTournaments > 0 ? [{ title: "Torneos pendientes", description: `${overdueTournaments} torneo${overdueTournaments === 1 ? "" : "s"} tiene fecha pasada y sigue pendiente.`, severity: "critical" as const }] : []),
      ...(simulator.available ? [] : [{ title: "Simulador sin datos", description: simulator.error ?? "El reporte no está disponible.", severity: "warning" as const }]),
    ],
  };
};

export const getAdminTournamentDashboardAction = async (input?: DashboardInput): Promise<TournamentDashboardData> => {
  await requireAdmin();
  const filters = parseInput(input);
  const period = resolveDashboardPeriod(filters);
  const where = buildTournamentWhere(filters, period.from, period.to);
  const [tournaments, statusBreakdown, formatCounts] = await Promise.all([
    prisma.tournament.findMany({ where, select: { id: true, createDate: true, format: true, status: true, storeId: true, tournamentPlayers: { select: { id: true } } } }),
    Promise.all((Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map(async (status) => ({ name: statusLabels[status], value: await prisma.tournament.count({ where: { ...where, status: status as TournamentStatus } }), color: statusColors[status] }))),
    Promise.all(
      ["Masters", "Elimination"].map(async (format) => ({
        name: format === "Masters" ? "Masters" : "Eliminación",
        value: await prisma.tournament.count({ where: { ...where, format: format as TournamentFormat } }),
      })),
    ),
  ]);
  const dateMap = new Map<string, number>();
  const playersDateMap = new Map<string, number>();
  tournaments.forEach(({ createDate, tournamentPlayers }) => {
    addToDateMap(dateMap, createDate);
    tournamentPlayers.forEach(() => addToDateMap(playersDateMap, createDate));
  });
  const started = tournaments.filter(({ status }) => status === "in_progress" || status === "finished").length;
  const finished = tournaments.filter(({ status }) => status === "finished").length;
  const players = tournaments.reduce((sum, tournament) => sum + tournament.tournamentPlayers.length, 0);
  const completion = tournaments.length === 0 ? 0 : Math.round((finished / tournaments.length) * 100);

  return {
    period: periodDto(period),
    updatedAt: new Date().toISOString(),
    kpis: [
      { label: "Torneos creados", value: tournaments.length },
      { label: "Torneos iniciados", value: started },
      { label: "Torneos finalizados", value: finished },
      { label: "Jugadores inscritos", value: players },
      { label: "Promedio de jugadores", value: tournaments.length ? Math.round((players / tournaments.length) * 10) / 10 : 0 },
      { label: "Finalización", value: completion, suffix: "%" },
    ],
    createdSeries: buildDateSeries(period, dateMap).map((point) => ({
      ...point,
      players: playersDateMap.get(point.date) ?? 0,
    })),
    averagePlayersSeries: buildDateSeries(period, dateMap).map((point) => ({
      ...point,
      value: point.value > 0
        ? Math.round(((playersDateMap.get(point.date) ?? 0) / point.value) * 10) / 10
        : 0,
    })),
    statusBreakdown,
    formatBreakdown: formatCounts,
  };
};

export const getAdminUserDashboardAction = async (input?: DashboardInput): Promise<UserDashboardData> => {
  await requireAdmin();
  const filters = parseInput(input);
  const period = resolveDashboardPeriod(filters);
  const userWhere = buildUserWhere(filters);
  const [total, newUsers, previousNewUsers, activeUsers, users, roleGroups, statusGroups, tournamentUsers, simulatorUsers] = await Promise.all([
    prisma.user.count({ where: userWhere }),
    countNewUsers(filters, period.from, period.to),
    countNewUsers(filters, period.previousFrom, period.previousTo),
    countUsersWithActivity(filters, period.from, period.to),
    prisma.user.findMany({ where: { ...userWhere, createdAt: { gte: period.from, lte: period.to } }, select: { createdAt: true } }),
    prisma.user.groupBy({ by: ["role"], where: userWhere, _count: { _all: true } }),
    prisma.user.groupBy({ by: ["status"], where: userWhere, _count: { _all: true } }),
    prisma.tournamentPlayer.findMany({ where: { createDate: { gte: period.from, lte: period.to } }, select: { userId: true } }),
    prisma.simulatorOAuthExchange.findMany({ where: { createdAt: { gte: period.from, lte: period.to } }, select: { userId: true } }),
  ]);
  const dateMap = new Map<string, number>();
  users.forEach(({ createdAt }) => addToDateMap(dateMap, createdAt));
  const activity = new Set([...tournamentUsers, ...simulatorUsers].map(({ userId }) => userId));

  const roleColors: Record<string, string> = {
    store: "#f59e0b",
    admin: "#38bdf8",
    player: "#a855f7",
    news: "#22c55e",
  };
  const roleFallbackColors = ["#f97316", "#06b6d4", "#ec4899", "#84cc16"];
  const statusColors: Record<string, string> = {
    active: "#22c55e",
    inactive: "#f59e0b",
    banned: "#ef4444",
  };

  return {
    period: periodDto(period),
    updatedAt: new Date().toISOString(),
    kpis: [
      { label: "Usuarios totales", value: total },
      { label: "Nuevos usuarios", value: newUsers, previousValue: previousNewUsers, change: percentageChange(newUsers, previousNewUsers) },
      { label: "Usuarios con actividad", value: activeUsers },
      { label: "Participantes en torneos", value: new Set(tournamentUsers.map(({ userId }) => userId)).size },
      { label: "Usuarios del simulador", value: new Set(simulatorUsers.map(({ userId }) => userId)).size },
      { label: "Actividad combinada", value: activity.size },
    ],
    registrationsSeries: buildDateSeries(period, dateMap),
    roleBreakdown: roleGroups.map(({ role, _count }, index) => ({ name: role, value: _count._all, color: roleColors[role] ?? roleFallbackColors[index % roleFallbackColors.length] })),
    statusBreakdown: statusGroups.map(({ status, _count }) => ({ name: status, value: _count._all, color: statusColors[status] ?? "#a78bfa" })),
    activityBreakdown: [
      { name: "Torneos", value: new Set(tournamentUsers.map(({ userId }) => userId)).size, color: "#f59e0b" },
      { name: "Simulador", value: new Set(simulatorUsers.map(({ userId }) => userId)).size, color: "#22c55e" },
      { name: "Actividad total", value: activeUsers, color: "#a855f7" },
    ],
  };
};

export const getAdminSimulatorDashboardAction = async (input?: DashboardInput) => {
  await requireAdmin();
  const filters = parseInput(input);
  const period = resolveDashboardPeriod(filters);
  return getSimulatorReport({ ...filters, from: period.fromKey, to: period.toKey });
};

export const getAdminDashboardOptionsAction = async () => {
  await requireAdmin();
  const stores = await prisma.store.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
  return stores;
};
