/*
  Reporte de jugadores diferentes por tienda en torneos recientes.

  Ejecutar desde app-souls:
    npm run seed:store-player-report

  Cambiar la cantidad de meses:
    npm run seed:store-player-report -- --months=6

  Generar salida en JSON:
    npm run seed:store-player-report -- --json
*/

import { PrismaClient, type TournamentStatus } from "@prisma/client";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

type StoreReport = {
  storeId: string;
  storeName: string;
  city: string;
  country: string;
  tournamentCount: number;
  tournamentPlayerEntries: number;
  players: Set<string>;
};

type ReportRow = {
  tienda: string;
  ciudad: string;
  pais: string;
  torneos: number;
  inscripciones: number;
  jugadoresDiferentes: number;
};

const DEFAULT_MONTHS = 3;
const INCLUDED_STATUSES: TournamentStatus[] = ["in_progress", "finished"];

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

const parsePositiveIntegerArg = (name: string, fallback: number) => {
  const prefix = `${name}=`;
  const rawValue = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (!rawValue) return fallback;

  const value = Number(rawValue);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} debe ser un entero positivo.`);
  }

  return value;
};

const subtractMonths = (date: Date, months: number) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
};

const getDatabaseInfo = (databaseUrl: string) => {
  let databaseName = "unknown";

  try {
    const parsed = new URL(databaseUrl);
    const pathname = parsed.pathname.replace(/^\//, "");
    databaseName = pathname || "unknown";
  } catch {
    const match = databaseUrl.match(/\/([^/?]+)(?:\?|$)/);
    databaseName = match?.[1] ?? "unknown";
  }

  const environmentHint = /six2/i.test(databaseUrl)
    ? "six2"
    : /sixdev/i.test(databaseUrl)
      ? "sixDev"
      : "unknown";

  return { databaseName, environmentHint };
};

const buildReport = async (prisma: PrismaClient, fromDate: Date, toDate: Date) => {
  const tournaments = await prisma.tournament.findMany({
    where: {
      date: {
        gte: fromDate,
        lte: toDate,
      },
      status: {
        in: INCLUDED_STATUSES,
      },
    },
    select: {
      id: true,
      storeId: true,
      store: {
        select: {
          name: true,
          city: true,
          country: true,
        },
      },
      tournamentPlayers: {
        select: {
          userId: true,
        },
      },
    },
  });

  const reportsByStore = new Map<string, StoreReport>();
  const globalPlayers = new Set<string>();

  for (const tournament of tournaments) {
    const report = reportsByStore.get(tournament.storeId) ?? {
      storeId: tournament.storeId,
      storeName: tournament.store.name,
      city: tournament.store.city,
      country: tournament.store.country,
      tournamentCount: 0,
      tournamentPlayerEntries: 0,
      players: new Set<string>(),
    };

    const tournamentPlayers = new Set(
      tournament.tournamentPlayers.map((player) => player.userId),
    );

    report.tournamentCount += 1;
    report.tournamentPlayerEntries += tournamentPlayers.size;

    for (const userId of tournamentPlayers) {
      report.players.add(userId);
      globalPlayers.add(userId);
    }

    reportsByStore.set(tournament.storeId, report);
  }

  const rows: ReportRow[] = Array.from(reportsByStore.values())
    .map((report) => ({
      tienda: report.storeName,
      ciudad: report.city,
      pais: report.country,
      torneos: report.tournamentCount,
      inscripciones: report.tournamentPlayerEntries,
      jugadoresDiferentes: report.players.size,
    }))
    .sort((a, b) => {
      const playersDiff = b.jugadoresDiferentes - a.jugadoresDiferentes;
      if (playersDiff !== 0) return playersDiff;
      return a.tienda.localeCompare(b.tienda);
    });

  return {
    rows,
    tournamentsCount: tournaments.length,
    globalUniquePlayers: globalPlayers.size,
  };
};

const main = async () => {
  loadLocalEnv();

  const databaseUrl = getRequiredEnv("DATABASE_URL");
  const months = parsePositiveIntegerArg("--months", DEFAULT_MONTHS);
  const asJson = hasArg("--json");
  const toDate = new Date();
  const fromDate = subtractMonths(toDate, months);
  const databaseInfo = getDatabaseInfo(databaseUrl);
  const prisma = new PrismaClient();

  try {
    const report = await buildReport(prisma, fromDate, toDate);
    const payload = {
      database: databaseInfo,
      filters: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        statuses: INCLUDED_STATUSES,
      },
      totals: {
        stores: report.rows.length,
        tournaments: report.tournamentsCount,
        globalUniquePlayers: report.globalUniquePlayers,
      },
      rows: report.rows,
    };

    if (asJson) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }

    console.log("[store-player-activity-report]");
    console.log(`DB: ${payload.database.databaseName} (${payload.database.environmentHint})`);
    console.log(`Rango: ${payload.filters.from} - ${payload.filters.to}`);
    console.log(`Estados incluidos: ${payload.filters.statuses.join(", ")}`);
    console.log(
      `Totales: ${payload.totals.stores} tiendas, ${payload.totals.tournaments} torneos, ${payload.totals.globalUniquePlayers} jugadores unicos globales`,
    );

    if (payload.rows.length === 0) {
      console.log("No se encontraron torneos jugados en el rango.");
      return;
    }

    console.table(payload.rows);
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((error) => {
  console.error("[store-player-activity-report]", error);
  process.exit(1);
});
