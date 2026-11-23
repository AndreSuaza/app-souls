"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  IoAddOutline,
  IoCheckmarkCircleOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCloseCircleOutline,
  IoCreateOutline,
  IoRefreshOutline,
  IoSwapHorizontalOutline,
} from "react-icons/io5";
import {
  activateCompetitiveSeasonAction,
  closeCompetitiveSeasonAction,
  createCompetitiveSeasonAction,
  createTransitionSeasonAction,
  restartCompetitiveSeasonAction,
  updateCompetitiveSeasonAction,
} from "@/actions/admin/competitive-season.action";
import type { CompetitiveSeasonDashboard } from "@/actions/admin/competitive-season.action";
import {
  AdminDashboardKpis,
  AdminDashboardNav,
  AdminDashboardUpdatedAt,
} from "@/components/admin/dashboard/AdminDashboardShell";
import {
  DashboardChartCard,
  DashboardLineChart,
  DashboardPlayerBarChart,
} from "@/components/admin/dashboard/AdminDashboardCharts";
import { useAlertConfirmationStore, useToastStore } from "@/store";

type Season = {
  id: string;
  seasonNumber: number;
  name: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "CLOSED";
  startsAt: string | null;
  endsAt: string | null;
  activatedAt: string | null;
  closedAt: string | null;
  isTransition: boolean;
  createdAt: string;
};

type Props = {
  seasons: Season[];
  initialSeasonId: string | null;
  initialDashboard: CompetitiveSeasonDashboard | null;
};

const statusLabel: Record<Season["status"], string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activa",
  CLOSED: "Cerrada",
};

const dateLabel = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(value))
    : "Sin fecha";

const shortDateLabel = (value: string) =>
  new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" }).format(new Date(value));

const numberLabel = (value: number) => new Intl.NumberFormat("es-CO").format(value);

const tableCardClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:shadow-lg dark:shadow-black/10";

export const CompetitiveSeasonManager = ({ seasons, initialSeasonId, initialDashboard }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Season | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const showToast = useToastStore((state) => state.showToast);
  const openConfirmation = useAlertConfirmationStore((state) => state.openAlertConfirmation);
  const selected = seasons.find((season) => season.id === initialSeasonId) ?? null;
  const dashboard = initialDashboard;

  const run = (operation: () => Promise<unknown>, success: string) => {
    startTransition(async () => {
      try {
        await operation();
        showToast(success, "success");
        router.refresh();
      } catch (error) {
        showToast(error instanceof Error ? error.message : "No se pudo completar la operación.", "error");
      }
    });
  };

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setStartsAt("");
    setEndsAt("");
    setShowForm(true);
  };

  const openEdit = (season: Season) => {
    setEditing(season);
    setName(season.name);
    setDescription(season.description ?? "");
    setStartsAt(season.startsAt?.slice(0, 10) ?? "");
    setEndsAt(season.endsAt?.slice(0, 10) ?? "");
    setShowForm(true);
  };

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = { name, description: description || null, startsAt: startsAt || null, endsAt: endsAt || null };
    if (editing) {
      run(() => updateCompetitiveSeasonAction({ ...input, seasonId: editing.id }), "Temporada actualizada.");
    } else {
      run(() => createCompetitiveSeasonAction(input), "Temporada creada en borrador.");
    }
    setShowForm(false);
  };

  const selectSeason = (seasonId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("seasonId", seasonId);
    params.delete("page");
    startTransition(() => router.push(`/admin/temporadas?${params.toString()}`));
  };

  const selectPage = (page: number) => {
    if (!dashboard) return;
    const params = new URLSearchParams(window.location.search);
    params.set("seasonId", initialSeasonId ?? "");
    params.set("page", String(page));
    startTransition(() => router.push(`/admin/temporadas?${params.toString()}`));
  };

  const confirmClose = (season: Season, restart: boolean) => {
    openConfirmation({
      text: restart ? "¿Cerrar y preparar la siguiente temporada?" : "¿Cerrar esta temporada?",
      description: "Se guardará un snapshot de todos los jugadores y se reiniciarán ELO, PV, partidas y torneos. Esta acción es definitiva.",
      confirmText: restart ? "CERRAR Y CREAR" : "CERRAR TEMPORADA",
      confirmPlaceholder: restart ? "Escribe CERRAR Y CREAR" : "Escribe CERRAR TEMPORADA",
      action: async () => {
        try {
          if (restart) await restartCompetitiveSeasonAction({ seasonId: season.id });
          else await closeCompetitiveSeasonAction({ seasonId: season.id });
          showToast(restart ? "Temporada cerrada y siguiente creada." : "Temporada cerrada y snapshot guardado.", "success");
          router.refresh();
          return true;
        } catch (error) {
          showToast(error instanceof Error ? error.message : "No se pudo cerrar la temporada.", "error");
          return false;
        }
      },
    });
  };

  const kpis = dashboard
    ? [
        { label: "Jugadores", value: dashboard.kpis.players },
        { label: "Torneos", value: dashboard.kpis.tournaments },
        { label: "Partidas", value: dashboard.kpis.matches },
        { label: "PV otorgados", value: dashboard.kpis.pvAwarded },
        { label: "PV ajustados", value: dashboard.kpis.pvAdjusted },
        { label: "PV gastados", value: dashboard.kpis.pvSpent },
      ]
    : [];

  const eloChart = useMemo(
    () => dashboard?.topPlayers.slice(0, 10).map((player) => ({ name: player.nickname, value: player.eloPoints, href: `/perfil/${player.id}` })) ?? [],
    [dashboard],
  );
  const pvChart = useMemo(
    () => dashboard?.topPvPlayers.slice(0, 10).map((player) => ({ name: player.nickname, value: player.victoryPoints, href: `/perfil/${player.id}` })) ?? [],
    [dashboard],
  );
  const activityChart = useMemo(
    () => dashboard?.daily.map((metric) => ({ label: shortDateLabel(metric.date), value: metric.matches })) ?? [],
    [dashboard],
  );
  const pvMovementChart = useMemo(
    () => dashboard?.daily.map((metric) => ({ label: shortDateLabel(metric.date), value: metric.pvAwarded + metric.pvAdjusted - metric.pvSpent })) ?? [],
    [dashboard],
  );
  const page = dashboard?.tournamentPagination.page ?? 1;
  const totalPages = dashboard?.tournamentPagination.totalPages ?? 1;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-700 dark:text-purple-300">Competencia</div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Temporadas competitivas</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">Consulta el rendimiento, la actividad y los rankings de cada ciclo competitivo.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="competitive-season-select">Temporada</label>
          <select id="competitive-season-select" value={initialSeasonId ?? ""} onChange={(event) => selectSeason(event.target.value)} className="h-10 min-w-[230px] rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-purple-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:focus:border-purple-400">
            <option value="" disabled>Selecciona una temporada</option>
            {seasons.map((season) => <option key={season.id} value={season.id}>{season.isTransition ? "Histórico previo" : `${season.name} · ${statusLabel[season.status]}`}</option>)}
          </select>
          <button type="button" onClick={() => router.refresh()} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:border-purple-400 hover:text-purple-700 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:text-white" aria-label="Actualizar"><IoRefreshOutline size={18} /></button>
          <button type="button" onClick={openCreate} className="inline-flex h-10 items-center gap-2 rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700"><IoAddOutline size={18} /> Nueva temporada</button>
          {!seasons.some((season) => season.isTransition) && <button type="button" onClick={() => run(() => createTransitionSeasonAction(), "Snapshot histórico creado.")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-purple-400 hover:text-purple-700 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:text-white"><IoSwapHorizontalOutline size={18} /> Histórico previo</button>}
        </div>
      </div>

      <AdminDashboardNav active="temporadas" />

      {!selected && <div className={tableCardClass}><p className="text-sm text-slate-600 dark:text-slate-400">No hay temporadas creadas todavía.</p></div>}

      {selected && dashboard && <>
        <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">{selected.isTransition ? "Histórico previo" : selected.name}</h2><span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-800 dark:bg-purple-500/15 dark:text-purple-200">{statusLabel[selected.status]}</span></div><p className="mt-1 text-xs text-slate-500">{dateLabel(selected.startsAt)} — {dateLabel(selected.endsAt)}</p></div><div className="flex items-center gap-3"><AdminDashboardUpdatedAt value={dashboard.updatedAt} />{(selected.status === "DRAFT" || selected.status === "ACTIVE") && <button type="button" onClick={() => openEdit(selected)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-purple-400 hover:text-purple-700 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:text-white"><IoCreateOutline /> Editar</button>}{selected.status === "DRAFT" && <button type="button" onClick={() => run(() => activateCompetitiveSeasonAction({ seasonId: selected.id }), "Temporada activada.")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"><IoCheckmarkCircleOutline /> Activar</button>}{selected.status === "ACTIVE" && <><button type="button" onClick={() => confirmClose(selected, false)} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"><IoCloseCircleOutline /> Cerrar</button><button type="button" onClick={() => confirmClose(selected, true)} className="hidden items-center gap-2 rounded-lg border border-purple-300 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 sm:inline-flex dark:border-purple-400/40 dark:text-purple-200 dark:hover:bg-purple-500/10"><IoSwapHorizontalOutline /> Preparar siguiente</button></>}</div></div>

        <AdminDashboardKpis items={kpis} />

        <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]"><DashboardChartCard title="Ranking ELO" subtitle="Los 10 jugadores con mayor ELO de la temporada" chartClassName="h-[22rem]"><DashboardPlayerBarChart data={eloChart} name="ELO" /></DashboardChartCard><DashboardChartCard title="Actividad de partidas" subtitle="Partidas registradas por fecha" chartClassName="h-[22rem]"><DashboardLineChart data={activityChart} name="Partidas" color="#8b5cf6" /></DashboardChartCard></div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1.35fr]"><DashboardChartCard title="Ranking de PV" subtitle="Los jugadores con más puntos de victoria" chartClassName="h-[22rem]"><DashboardPlayerBarChart data={pvChart} name="PV" /></DashboardChartCard><DashboardChartCard title="Movimiento neto de PV" subtitle="PV otorgados, ajustados y gastados por fecha" chartClassName="h-[22rem]"><DashboardLineChart data={pvMovementChart} name="PV netos" color="#22c55e" allowDecimals /></DashboardChartCard></div>

        <div className={tableCardClass}><div className="mb-4"><h2 className="text-base font-semibold text-slate-900 dark:text-white">Ranking detallado</h2><p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Consulta ELO, PV, partidas y tasa de victorias.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="pb-3">#</th><th className="pb-3">Jugador</th><th className="pb-3 text-right">ELO</th><th className="pb-3 text-right">PV</th><th className="pb-3 text-right">Partidas</th><th className="pb-3 text-right">Winrate</th></tr></thead><tbody>{dashboard.topPlayers.map((player) => <tr key={player.id} className="border-t border-slate-200 dark:border-tournament-dark-border"><td className="py-3 text-slate-500">{player.eloRank ?? "—"}</td><td className="py-3 font-semibold text-slate-900 dark:text-white">{player.nickname}</td><td className="py-3 text-right font-semibold text-purple-700 dark:text-purple-300">{numberLabel(player.eloPoints)}</td><td className="py-3 text-right text-slate-700 dark:text-slate-300">{numberLabel(player.victoryPoints)}</td><td className="py-3 text-right text-slate-700 dark:text-slate-300">{numberLabel(player.matchesPlayed)}</td><td className="py-3 text-right text-slate-700 dark:text-slate-300">{player.winrate}%</td></tr>)}</tbody></table></div></div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1.35fr]"><div className={tableCardClass}><div className="mb-4"><h2 className="text-base font-semibold text-slate-900 dark:text-white">Tiendas participantes</h2><p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Actividad registrada durante la temporada.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[440px] text-left text-sm"><thead className="text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="pb-3">Tienda</th><th className="pb-3">Ciudad</th><th className="pb-3 text-right">Torneos</th><th className="pb-3 text-right">Jugadores</th></tr></thead><tbody>{dashboard.stores.map((store) => <tr key={`${store.storeName}-${store.city}`} className="border-t border-slate-200 dark:border-tournament-dark-border"><td className="py-3 font-semibold text-slate-900 dark:text-white">{store.storeName}</td><td className="py-3 text-slate-600 dark:text-slate-400">{store.city}</td><td className="py-3 text-right text-slate-700 dark:text-slate-300">{numberLabel(store.tournaments)}</td><td className="py-3 text-right text-slate-700 dark:text-slate-300">{numberLabel(store.uniquePlayers)}</td></tr>)}</tbody></table></div></div>

          <div className={tableCardClass}><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-base font-semibold text-slate-900 dark:text-white">Torneos de la temporada</h2><p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{numberLabel(dashboard.tournamentPagination.total)} torneos asociados al ciclo seleccionado.</p></div><span className="text-xs text-slate-500">Página {page} de {totalPages}</span></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="pb-3">Torneo</th><th className="pb-3">Fecha</th><th className="pb-3">Tienda</th><th className="pb-3 text-right">Jugadores</th><th className="pb-3 text-right">Partidas</th><th className="pb-3">Estado</th></tr></thead><tbody>{dashboard.tournaments.map((tournament) => <tr key={tournament.id} className="border-t border-slate-200 dark:border-tournament-dark-border"><td className="py-3 font-semibold text-slate-900 dark:text-white">{tournament.title}</td><td className="py-3 text-slate-600 dark:text-slate-400">{dateLabel(tournament.date)}</td><td className="py-3 text-slate-600 dark:text-slate-400">{tournament.store.name}</td><td className="py-3 text-right text-slate-700 dark:text-slate-300">{numberLabel(tournament.players)}</td><td className="py-3 text-right text-slate-700 dark:text-slate-300">{numberLabel(tournament.matches)}</td><td className="py-3 text-xs text-slate-500">{tournament.status}</td></tr>)}</tbody></table></div><div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-tournament-dark-border"><span className="text-xs text-slate-500">Mostrando {dashboard.tournaments.length} de {numberLabel(dashboard.tournamentPagination.total)}</span><div className="flex items-center gap-1"><button type="button" onClick={() => selectPage(page - 1)} disabled={page <= 1 || isPending} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-tournament-dark-border dark:text-slate-300" aria-label="Página anterior"><IoChevronBackOutline /></button><span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-purple-600 px-2 text-xs font-semibold text-white">{page}</span><button type="button" onClick={() => selectPage(page + 1)} disabled={page >= totalPages || isPending} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-tournament-dark-border dark:text-slate-300" aria-label="Página siguiente"><IoChevronForwardOutline /></button></div></div></div>
        </div>
      </>}

      {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><form onSubmit={submitForm} className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-slate-900 dark:text-white">{editing ? "Editar temporada" : "Nueva temporada"}</h2><button type="button" onClick={() => setShowForm(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-xl text-slate-500 hover:border-purple-400 hover:text-purple-700 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:text-white" aria-label="Cerrar">×</button></div><label className="block text-sm text-slate-700 dark:text-slate-300">Nombre<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-purple-500 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white" /></label><label className="block text-sm text-slate-700 dark:text-slate-300">Descripción<textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-purple-500 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm text-slate-700 dark:text-slate-300">Inicio<input type="date" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white" /></label><label className="block text-sm text-slate-700 dark:text-slate-300">Cierre previsto<input type="date" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white" /></label></div><div className="flex justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-tournament-dark-border dark:text-slate-300">Cancelar</button><button type="submit" disabled={isPending} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Guardar</button></div></form></div>}
    </section>
  );
};
