"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  IoAnalyticsOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoGameControllerOutline,
  IoPeopleOutline,
  IoPersonAddOutline,
  IoPulseOutline,
  IoRefreshOutline,
  IoSpeedometerOutline,
  IoStatsChartOutline,
  IoTrophyOutline,
  IoTrendingUpOutline,
} from "react-icons/io5";
import type { IconType } from "react-icons";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { DashboardKpi } from "@/actions/admin/dashboard-analytics.action";
import { useUIStore } from "@/store";

const useDashboardNavigation = () => {
  const [isPending, startTransition] = useTransition();
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const wasPending = useRef(false);

  useEffect(() => {
    if (isPending) {
      wasPending.current = true;
      showLoading("Cargando datos del dashboard...");
      return;
    }

    if (wasPending.current) {
      wasPending.current = false;
      hideLoading();
    }
  }, [hideLoading, isPending, showLoading]);

  return (action: () => void) => {
    startTransition(action);
  };
};

export const AdminDashboardFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigate = useDashboardNavigation();
  const preset = searchParams.get("preset") ?? "30";
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const isTournamentDashboard = pathname === "/admin/torneos/dashboard";
  useEffect(() => {
    setFrom(searchParams.get("from") ?? "");
    setTo(searchParams.get("to") ?? "");
  }, [searchParams]);

  const updatePreset = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("preset", value);
    params.delete("from");
    params.delete("to");
    if (isTournamentDashboard) params.delete("tournamentId");
    setFrom("");
    setTo("");
    navigate(() => router.push(`${pathname}?${params.toString()}`));
  };

  const refresh = () => navigate(() => router.refresh());

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
      <div className="order-1 flex min-w-0 flex-1 items-center gap-1 sm:flex-none">
        {(["7", "30", "90"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => updatePreset(value)}
            className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition sm:flex-none sm:px-3 ${preset === value ? "bg-purple-600 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-tournament-dark-muted dark:hover:text-white"}`}
          >
            {value} días
          </button>
        ))}
      </div>
      <span className="order-2 hidden h-6 w-px bg-slate-200 dark:bg-tournament-dark-border sm:block" />
      <div className="order-3 grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
        <label className="flex min-w-0 items-center gap-1 text-[11px] text-slate-600 sm:gap-2 sm:text-xs dark:text-slate-400">
          <span className="shrink-0">Desde</span>
          <input
            type="date"
            value={from}
            onChange={(event) => {
              const nextFrom = event.target.value;
              setFrom(nextFrom);
              if (!nextFrom || !to) return;
              const params = new URLSearchParams(searchParams.toString());
              params.set("from", nextFrom);
              params.set("to", to);
              params.set("preset", "custom");
              if (isTournamentDashboard) params.delete("tournamentId");
              navigate(() => router.push(`${pathname}?${params.toString()}`));
            }}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-1.5 py-2 text-slate-900 sm:px-2 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white"
          />
        </label>
        <label className="flex min-w-0 items-center gap-1 text-[11px] text-slate-600 sm:gap-2 sm:text-xs dark:text-slate-400">
          <span className="shrink-0">Hasta</span>
          <input
            type="date"
            value={to}
            onChange={(event) => {
              const nextTo = event.target.value;
              setTo(nextTo);
              if (!nextTo || !from) return;
              const params = new URLSearchParams(searchParams.toString());
              params.set("from", from);
              params.set("to", nextTo);
              params.set("preset", "custom");
              if (isTournamentDashboard) params.delete("tournamentId");
              navigate(() => router.push(`${pathname}?${params.toString()}`));
            }}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-1.5 py-2 text-slate-900 sm:px-2 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={refresh}
        aria-label="Actualizar datos"
        className="order-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 p-0 text-slate-600 transition hover:border-purple-400 hover:text-purple-700 sm:order-4 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:text-white"
        title="Actualizar datos"
      >
        <IoRefreshOutline size={18} aria-hidden="true" />
      </button>
    </div>
  );
};

type DashboardTournamentOption = {
  id: string;
  title: string;
  date: string;
  status: string;
};

const tournamentStatusLabels: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  finished: "Finalizado",
  cancelled: "Cancelado",
};

const formatTournamentOptionDate = (value: string) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const AdminDashboardTournamentFilter = ({
  tournaments,
}: {
  tournaments: DashboardTournamentOption[];
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigate = useDashboardNavigation();
  const selectedId = searchParams.get("tournamentId") ?? "";
  const selectedTournament = tournaments.find(({ id }) => id === selectedId);
  const [query, setQuery] = useState(selectedTournament?.title ?? "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setQuery(selectedTournament?.title ?? "");
  }, [selectedTournament?.title]);

  const filteredTournaments = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    if (!normalizedQuery) return tournaments.slice(0, 50);
    return tournaments
      .filter((tournament) =>
        tournament.title.toLocaleLowerCase("es").includes(normalizedQuery),
      )
      .slice(0, 50);
  }, [query, tournaments]);

  const selectTournament = (tournament: DashboardTournamentOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tournamentId", tournament.id);
    ["preset", "from", "to", "storeId", "format", "status"].forEach((key) =>
      params.delete(key),
    );
    setQuery(tournament.title);
    setIsOpen(false);
    navigate(() => router.push(`${pathname}?${params.toString()}`));
  };

  const clearTournament = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tournamentId");
    setQuery("");
    setIsOpen(false);
    navigate(() => router.push(`${pathname}?${params.toString()}`));
  };

  return (
    <div className="relative min-w-[220px] flex-1 sm:min-w-[280px] sm:flex-none">
      <label className="sr-only" htmlFor="admin-tournament-filter">
        Buscar torneo
      </label>
      <input
        id="admin-tournament-filter"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
          if (!event.target.value) clearTournament();
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 150)}
        placeholder="Todos los torneos"
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="admin-tournament-options"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white dark:focus:border-purple-400"
      />
      {selectedTournament && (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={clearTournament}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-1 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          aria-label="Mostrar todos los torneos"
        >
          ×
        </button>
      )}
      {isOpen && filteredTournaments.length > 0 && (
        <div
          id="admin-tournament-options"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface"
        >
          <button
            type="button"
            role="option"
            aria-selected={!selectedId}
            onMouseDown={(event) => event.preventDefault()}
            onClick={clearTournament}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
          >
            Todos los torneos
          </button>
          {filteredTournaments.map((tournament) => (
            <button
              key={tournament.id}
              type="button"
              role="option"
              aria-selected={selectedId === tournament.id}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectTournament(tournament)}
              className="w-full rounded-md px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-tournament-dark-muted"
            >
              <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                {tournament.title}
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                {formatTournamentOptionDate(tournament.date)} ·{" "}
                {tournamentStatusLabels[tournament.status] ?? tournament.status}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminDashboardSelectFilters = ({
  kind,
  stores = [],
  tournaments = [],
}: {
  kind: "tournaments" | "users" | "simulator" | "pv";
  stores?: Array<{ id: string; name: string }>;
  tournaments?: DashboardTournamentOption[];
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigate = useDashboardNavigation();
  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (
      kind === "tournaments" &&
      ["storeId", "format", "status"].includes(key)
    ) {
      params.delete("tournamentId");
    }
    navigate(() => router.push(`${pathname}?${params.toString()}`));
  };
  const select = (
    key: string,
    label: string,
    options: Array<{ value: string; label: string }>,
  ) => (
    <label
      key={key}
      className="flex min-w-[150px] flex-1 items-center gap-2 text-xs text-slate-600 sm:flex-none dark:text-slate-400"
    >
      <span className="sr-only">{label}</span>
      <select
        value={searchParams.get(key) ?? ""}
        onChange={(event) => update(key, event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white dark:focus:border-purple-400"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
      {(kind === "tournaments" || kind === "users") &&
        select(
          "storeId",
          "Todas las tiendas",
          stores.map((store) => ({ value: store.id, label: store.name })),
        )}
      {kind === "tournaments" && (
        <AdminDashboardTournamentFilter tournaments={tournaments} />
      )}
      {kind === "tournaments" && (
        <>
          {select("format", "Todos los formatos", [
            { value: "Masters", label: "Masters" },
            { value: "Elimination", label: "Eliminación" },
          ])}
          {select("status", "Todos los estados", [
            { value: "pending", label: "Pendientes" },
            { value: "in_progress", label: "En curso" },
            { value: "finished", label: "Finalizados" },
            { value: "cancelled", label: "Cancelados" },
          ])}
        </>
      )}
      {(kind === "users" || kind === "pv") && (
        <>
          {select("role", "Todos los roles", [
            { value: "admin", label: "Admin" },
            { value: "store", label: "Store" },
            { value: "news", label: "Noticias" },
            { value: "player", label: "Jugadores" },
          ])}
          {select("userStatus", "Todos los estados", [
            { value: "active", label: "Activos" },
            { value: "inactive", label: "Inactivos" },
            { value: "banned", label: "Baneados" },
          ])}
        </>
      )}
      {kind === "simulator" && (
        <>
          {select("mode", "Todos los modos", [
            { value: "manual", label: "Manual" },
            { value: "matchmaking", label: "Matchmaking" },
          ])}
          {select("matchMode", "Todas las modalidades", [
            { value: "bestOf1", label: "Mejor de 1" },
            { value: "bestOf3", label: "Mejor de 3" },
          ])}
          {select("simulatorStatus", "Todos los estados", [
            { value: "completed", label: "Finalizadas" },
            { value: "active", label: "Activas" },
          ])}
        </>
      )}
    </div>
  );
};

export const AdminDashboardHeader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
    <div>
      <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-700 dark:text-purple-300">
        <IoAnalyticsOutline /> Analítica administrativa
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
    <AdminDashboardFilters />
  </div>
);

export const AdminDashboardNav = ({ active }: { active: string }) => (
  <nav
    className="flex min-w-0 gap-2 overflow-x-auto pb-1"
    aria-label="Dashboards administrativos"
  >
    {[
      { id: "general", label: "General", href: "/admin" },
      { id: "torneos", label: "Torneos", href: "/admin/torneos/dashboard" },
      { id: "usuarios", label: "Usuarios", href: "/admin/usuarios/dashboard" },
      {
        id: "simulador",
        label: "Simulador",
        href: "/admin/simulador/dashboard",
      },
      { id: "pv", label: "PV", href: "/admin/pv/dashboard" },
    ].map((item) => (
      <Link
        key={item.id}
        href={item.href}
        className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-semibold transition ${active === item.id ? "border-purple-300 bg-purple-100 text-purple-800 dark:border-purple-400 dark:bg-purple-600/20 dark:text-purple-200" : "border-slate-300 text-slate-600 hover:border-purple-400 hover:text-purple-700 dark:border-tournament-dark-border dark:text-slate-400 dark:hover:text-white"}`}
      >
        {item.label}
      </Link>
    ))}
  </nav>
);

const kpiStyles: Array<{ icon: IconType; color: string; background: string }> =
  [
    {
      icon: IoPeopleOutline,
      color: "text-purple-700 dark:text-purple-200",
      background: "bg-purple-100 dark:bg-purple-500/15",
    },
    {
      icon: IoPersonAddOutline,
      color: "text-sky-700 dark:text-sky-200",
      background: "bg-sky-100 dark:bg-sky-500/15",
    },
    {
      icon: IoPulseOutline,
      color: "text-emerald-700 dark:text-emerald-200",
      background: "bg-emerald-100 dark:bg-emerald-500/15",
    },
    {
      icon: IoTrophyOutline,
      color: "text-amber-700 dark:text-amber-200",
      background: "bg-amber-100 dark:bg-amber-500/15",
    },
    {
      icon: IoGameControllerOutline,
      color: "text-cyan-700 dark:text-cyan-200",
      background: "bg-cyan-100 dark:bg-cyan-500/15",
    },
    {
      icon: IoCheckmarkCircleOutline,
      color: "text-violet-700 dark:text-violet-200",
      background: "bg-violet-100 dark:bg-violet-500/15",
    },
    {
      icon: IoCalendarOutline,
      color: "text-rose-700 dark:text-rose-200",
      background: "bg-rose-100 dark:bg-rose-500/15",
    },
    {
      icon: IoStatsChartOutline,
      color: "text-indigo-700 dark:text-indigo-200",
      background: "bg-indigo-100 dark:bg-indigo-500/15",
    },
    {
      icon: IoTrendingUpOutline,
      color: "text-lime-700 dark:text-lime-200",
      background: "bg-lime-100 dark:bg-lime-500/15",
    },
    {
      icon: IoSpeedometerOutline,
      color: "text-orange-700 dark:text-orange-200",
      background: "bg-orange-100 dark:bg-orange-500/15",
    },
  ];

const formatKpiNumber = (value: number) => {
  const [integer, decimal] = value.toString().split(".");
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decimal ? `${formattedInteger},${decimal}` : formattedInteger;
};

export const AdminDashboardKpis = ({ items }: { items: DashboardKpi[] }) => (
  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
    {items.map((item, index) => {
      const style = kpiStyles[index % kpiStyles.length];
      const Icon = style.icon;

      return (
        <motion.article
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="flex min-h-[92px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:shadow-lg dark:shadow-black/10"
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 ${style.background}`}
          >
            <Icon className={style.color} size={21} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              {item.label}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-2xl font-bold leading-none text-slate-900 dark:text-white">
                {formatKpiNumber(item.value)}
                {item.suffix ?? ""}
              </p>
              {item.change !== undefined && (
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-bold ${item.change >= 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"}`}
                >
                  {item.change >= 0 ? "↑" : "↓"} {Math.abs(item.change)}%
                </span>
              )}
            </div>
            {item.previousValue !== undefined && (
              <p className="mt-1 truncate text-[10px] text-slate-500">
                vs. {formatKpiNumber(item.previousValue)} periodo anterior
              </p>
            )}
          </div>
        </motion.article>
      );
    })}
  </div>
);

const formatDashboardTimestamp = (value: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(
    parts.map(({ type, value: partValue }) => [type, partValue]),
  );
  return `${values.day}/${values.month}/${values.year}, ${values.hour}:${values.minute}`;
};

export const AdminDashboardUpdatedAt = ({ value }: { value: string }) => (
  <p className="text-xs text-slate-500">
    Actualizado {formatDashboardTimestamp(value)}
  </p>
);

export const AdminDashboardLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className="text-xs font-semibold text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-white"
  >
    {children} →
  </Link>
);
