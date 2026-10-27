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
import { useEffect, useRef, useState, useTransition } from "react";
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
  useEffect(() => {
    setFrom(searchParams.get("from") ?? "");
    setTo(searchParams.get("to") ?? "");
  }, [searchParams]);

  const updatePreset = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("preset", value);
    params.delete("from");
    params.delete("to");
    setFrom("");
    setTo("");
    navigate(() => router.push(`${pathname}?${params.toString()}`));
  };

  const refresh = () => navigate(() => router.refresh());

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-tournament-dark-border bg-tournament-dark-surface p-2">
      <div className="order-1 flex min-w-0 flex-1 items-center gap-1 sm:flex-none">
        {(["7", "30", "90"] as const).map((value) => (
          <button key={value} type="button" onClick={() => updatePreset(value)} className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition sm:flex-none sm:px-3 ${preset === value ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-tournament-dark-muted hover:text-white"}`}>
            {value} días
          </button>
        ))}
      </div>
      <span className="order-2 hidden h-6 w-px bg-tournament-dark-border sm:block" />
      <div className="order-3 grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
        <label className="flex min-w-0 items-center gap-1 text-[11px] text-slate-400 sm:gap-2 sm:text-xs">
          <span className="shrink-0">Desde</span>
          <input type="date" value={from} onChange={(event) => { const nextFrom = event.target.value; setFrom(nextFrom); if (!nextFrom || !to) return; const params = new URLSearchParams(searchParams.toString()); params.set("from", nextFrom); params.set("to", to); params.set("preset", "custom"); navigate(() => router.push(`${pathname}?${params.toString()}`)); }} className="min-w-0 flex-1 rounded-lg border border-tournament-dark-border bg-tournament-dark-muted px-1.5 py-2 text-white sm:px-2" />
        </label>
        <label className="flex min-w-0 items-center gap-1 text-[11px] text-slate-400 sm:gap-2 sm:text-xs">
          <span className="shrink-0">Hasta</span>
          <input type="date" value={to} onChange={(event) => { const nextTo = event.target.value; setTo(nextTo); if (!nextTo || !from) return; const params = new URLSearchParams(searchParams.toString()); params.set("from", from); params.set("to", nextTo); params.set("preset", "custom"); navigate(() => router.push(`${pathname}?${params.toString()}`)); }} className="min-w-0 flex-1 rounded-lg border border-tournament-dark-border bg-tournament-dark-muted px-1.5 py-2 text-white sm:px-2" />
        </label>
      </div>
      <button type="button" onClick={refresh} aria-label="Actualizar datos" className="order-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-tournament-dark-border p-0 text-slate-300 transition hover:border-purple-400 hover:text-white sm:order-4" title="Actualizar datos">
        <IoRefreshOutline size={18} aria-hidden="true" />
      </button>
    </div>
  );
};

export const AdminDashboardSelectFilters = ({
  kind,
  stores = [],
}: {
  kind: "tournaments" | "users" | "simulator" | "pv";
  stores?: Array<{ id: string; name: string }>;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigate = useDashboardNavigation();
  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    navigate(() => router.push(`${pathname}?${params.toString()}`));
  };
  const select = (key: string, label: string, options: Array<{ value: string; label: string }>) => (
    <label key={key} className="flex min-w-[150px] flex-1 items-center gap-2 text-xs text-slate-400 sm:flex-none">
      <span className="sr-only">{label}</span>
      <select value={searchParams.get(key) ?? ""} onChange={(event) => update(key, event.target.value)} className="w-full rounded-lg border border-tournament-dark-border bg-tournament-dark-muted px-3 py-2 text-sm text-white outline-none focus:border-purple-400">
        <option value="">{label}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );

  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-tournament-dark-border bg-tournament-dark-surface p-3">
      {(kind === "tournaments" || kind === "users") && select("storeId", "Todas las tiendas", stores.map((store) => ({ value: store.id, label: store.name })))}
      {kind === "tournaments" && <>{select("format", "Todos los formatos", [{ value: "Masters", label: "Masters" }, { value: "Elimination", label: "Eliminación" }])}{select("status", "Todos los estados", [{ value: "pending", label: "Pendientes" }, { value: "in_progress", label: "En curso" }, { value: "finished", label: "Finalizados" }, { value: "cancelled", label: "Cancelados" }])}</>}
      {(kind === "users" || kind === "pv") && <>{select("role", "Todos los roles", [{ value: "admin", label: "Admin" }, { value: "store", label: "Store" }, { value: "news", label: "Noticias" }, { value: "player", label: "Jugadores" }])}{select("userStatus", "Todos los estados", [{ value: "active", label: "Activos" }, { value: "inactive", label: "Inactivos" }, { value: "banned", label: "Baneados" }])}</>}
      {kind === "simulator" && <>{select("mode", "Todos los modos", [{ value: "manual", label: "Manual" }, { value: "matchmaking", label: "Matchmaking" }])}{select("matchMode", "Todas las modalidades", [{ value: "bestOf1", label: "Mejor de 1" }, { value: "bestOf3", label: "Mejor de 3" }])}{select("simulatorStatus", "Todos los estados", [{ value: "completed", label: "Finalizadas" }, { value: "active", label: "Activas" }])}</>}
    </div>
  );
};

export const AdminDashboardHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
    <div>
      <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-300"><IoAnalyticsOutline /> Analítica administrativa</div>
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>
    </div>
    <AdminDashboardFilters />
  </div>
);

export const AdminDashboardNav = ({ active }: { active: string }) => (
  <nav className="flex min-w-0 gap-2 overflow-x-auto pb-1" aria-label="Dashboards administrativos">
    {[{ id: "general", label: "General", href: "/admin" }, { id: "torneos", label: "Torneos", href: "/admin/torneos/dashboard" }, { id: "usuarios", label: "Usuarios", href: "/admin/usuarios/dashboard" }, { id: "simulador", label: "Simulador", href: "/admin/simulador/dashboard" }, { id: "pv", label: "PV", href: "/admin/pv/dashboard" }].map((item) => (
      <Link key={item.id} href={item.href} className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-semibold transition ${active === item.id ? "border-purple-400 bg-purple-600/20 text-purple-200" : "border-tournament-dark-border text-slate-400 hover:border-purple-400 hover:text-white"}`}>
        {item.label}
      </Link>
    ))}
  </nav>
);

const kpiStyles: Array<{ icon: IconType; color: string; background: string }> = [
  { icon: IoPeopleOutline, color: "text-purple-200", background: "bg-purple-500/15" },
  { icon: IoPersonAddOutline, color: "text-sky-200", background: "bg-sky-500/15" },
  { icon: IoPulseOutline, color: "text-emerald-200", background: "bg-emerald-500/15" },
  { icon: IoTrophyOutline, color: "text-amber-200", background: "bg-amber-500/15" },
  { icon: IoGameControllerOutline, color: "text-cyan-200", background: "bg-cyan-500/15" },
  { icon: IoCheckmarkCircleOutline, color: "text-violet-200", background: "bg-violet-500/15" },
  { icon: IoCalendarOutline, color: "text-rose-200", background: "bg-rose-500/15" },
  { icon: IoStatsChartOutline, color: "text-indigo-200", background: "bg-indigo-500/15" },
  { icon: IoTrendingUpOutline, color: "text-lime-200", background: "bg-lime-500/15" },
  { icon: IoSpeedometerOutline, color: "text-orange-200", background: "bg-orange-500/15" },
];

const formatKpiNumber = (value: number) => {
  const [integer, decimal] = value.toString().split(".");
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decimal ? `${formattedInteger},${decimal}` : formattedInteger;
};

export const AdminDashboardKpis = ({ items }: { items: DashboardKpi[] }) => (
  <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
    {items.map((item, index) => {
      const style = kpiStyles[index % kpiStyles.length];
      const Icon = style.icon;

      return (
        <motion.article key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="flex min-h-[92px] items-center gap-3 rounded-xl border border-tournament-dark-border bg-tournament-dark-surface px-3 py-3 shadow-lg shadow-black/10">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 ${style.background}`}>
            <Icon className={style.color} size={21} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-2xl font-bold leading-none text-white">{formatKpiNumber(item.value)}{item.suffix ?? ""}</p>
              {item.change !== undefined && <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${item.change >= 0 ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>{item.change >= 0 ? "↑" : "↓"} {Math.abs(item.change)}%</span>}
            </div>
            {item.previousValue !== undefined && <p className="mt-1 truncate text-[10px] text-slate-500">vs. {formatKpiNumber(item.previousValue)} periodo anterior</p>}
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
  const values = Object.fromEntries(parts.map(({ type, value: partValue }) => [type, partValue]));
  return `${values.day}/${values.month}/${values.year}, ${values.hour}:${values.minute}`;
};

export const AdminDashboardUpdatedAt = ({ value }: { value: string }) => (
  <p className="text-xs text-slate-500">Actualizado {formatDashboardTimestamp(value)}</p>
);

export const AdminDashboardLink = ({ href, children }: { href: string; children: React.ReactNode }) => <Link href={href} className="text-xs font-semibold text-purple-300 hover:text-white">{children} →</Link>;
