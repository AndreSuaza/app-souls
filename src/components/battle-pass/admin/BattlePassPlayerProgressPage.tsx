"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IoArrowBackOutline, IoPeopleOutline } from "react-icons/io5";
import {
  getAdminBattlePassesAction,
  type AdminBattlePassListItem,
} from "@/actions/battle-pass/admin-battle-pass.action";
import { useUIStore } from "@/store";
import { BattlePassPlayersPanel } from "./BattlePassPlayersPanel";

const statusLabels: Record<AdminBattlePassListItem["status"], string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  ARCHIVED: "Archivado",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export const BattlePassPlayerProgressPage = () => {
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const [passes, setPasses] = useState<AdminBattlePassListItem[]>([]);
  const [selectedPassId, setSelectedPassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPasses = useCallback(async () => {
    setError(null);
    setLoading(true);
    showLoading("Cargando pases de batalla...");

    try {
      const nextPasses = await getAdminBattlePassesAction();
      setPasses(nextPasses);
      setSelectedPassId((current) => {
        if (current && nextPasses.some((pass) => pass.id === current)) {
          return current;
        }

        return (
          nextPasses.find((pass) => pass.status === "ACTIVE")?.id ??
          nextPasses[0]?.id ??
          null
        );
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los pases de batalla.",
      );
    } finally {
      setLoading(false);
      hideLoading();
    }
  }, [hideLoading, showLoading]);

  useEffect(() => {
    loadPasses();

    return () => hideLoading();
  }, [hideLoading, loadPasses]);

  const selectedPass = useMemo(
    () => passes.find((pass) => pass.id === selectedPassId) ?? null,
    [passes, selectedPassId],
  );

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-700 dark:text-purple-300">
            <IoPeopleOutline aria-hidden="true" /> Administración de recompensas
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Progreso por jugador
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Consulta y ajusta el progreso individual de cada pase de batalla.
          </p>
        </div>
        <Link
          href="/admin/pase-batalla"
          className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-100 dark:border-purple-400/30 dark:bg-purple-500/10 dark:text-purple-200 dark:hover:bg-purple-500/20"
        >
          <IoArrowBackOutline className="h-4 w-4" />
          Volver al pase
        </Link>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Pase de batalla
            <select
              value={selectedPassId ?? ""}
              onChange={(event) => setSelectedPassId(event.target.value || null)}
              disabled={loading || passes.length === 0}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white"
            >
              {passes.length === 0 && <option value="">Sin pases disponibles</option>}
              {passes.map((pass) => (
                <option key={pass.id} value={pass.id}>
                  T{pass.seasonNumber} · {pass.title} · {statusLabels[pass.status]}
                </option>
              ))}
            </select>
          </label>

          {selectedPass && (
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-tournament-dark-muted dark:text-slate-300">
              <span className="font-semibold">{statusLabels[selectedPass.status]}</span>
              <span className="mx-2 text-slate-300 dark:text-slate-600">·</span>
              {formatDate(selectedPass.startsAt)} – {formatDate(selectedPass.endsAt)}
            </div>
          )}
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      <BattlePassPlayersPanel battlePassId={selectedPassId} />
    </section>
  );
};
