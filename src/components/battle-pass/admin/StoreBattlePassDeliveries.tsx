"use client";

import { useCallback, useEffect, useState } from "react";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import {
  fulfillStoreBattlePassDeliveryAction,
  getStoreBattlePassDeliveriesAction,
  type AdminBattlePassClaim,
} from "@/actions/battle-pass/admin-battle-pass.action";
import { useToastStore, useUIStore } from "@/store";

const claimStatusLabels: Record<string, string> = {
  CLAIMED: "Reclamado",
  PENDING_FULFILLMENT: "Pendiente",
  FULFILLED: "Entregado",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export const StoreBattlePassDeliveries = () => {
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const showToast = useToastStore((state) => state.showToast);

  const [deliveries, setDeliveries] = useState<AdminBattlePassClaim[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadDeliveries = useCallback(async () => {
    try {
      setError(null);
      showLoading("Cargando entregas en tienda...");
      const nextDeliveries = await getStoreBattlePassDeliveriesAction();
      setDeliveries(nextDeliveries);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las entregas en tienda.",
      );
    } finally {
      hideLoading();
    }
  }, [hideLoading, showLoading]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const markAsDelivered = async (claim: AdminBattlePassClaim) => {
    try {
      showLoading("Marcando entrega...");
      await fulfillStoreBattlePassDeliveryAction({ claimId: claim.id });
      await loadDeliveries();
      showToast("Entrega marcada como entregada.", "success");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "No se pudo marcar la entrega.",
        "error",
      );
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="min-w-0 space-y-6 overflow-hidden">
      <header className="rounded-2xl border border-tournament-dark-border bg-tournament-dark-surface p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Entregas en tienda
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Reclamos pendientes de recompensas fisicas de pases activos.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-900/20 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="min-w-0 rounded-2xl border border-tournament-dark-border bg-tournament-dark-surface p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">
              Pendientes
            </h2>
            <p className="text-xs text-slate-400">
              Solo se muestran entregas de pases activos.
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-amber-500/15 px-3 py-1 text-xs font-black uppercase text-amber-200">
            {deliveries.length} pendientes
          </span>
        </div>

        <div className="grid gap-3 md:hidden">
          {deliveries.map((claim) => (
            <article
              key={claim.id}
              className="rounded-xl border border-tournament-dark-border bg-tournament-dark-muted p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-white">
                    {claim.user.nickname || claim.user.email || "-"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {[claim.user.name, claim.user.lastname]
                      .filter(Boolean)
                      .join(" ") || "-"}
                  </p>
                </div>
                <span className="shrink-0 rounded-md bg-amber-500/15 px-2 py-1 text-[11px] font-black uppercase text-amber-200">
                  {claimStatusLabels[claim.status] ?? claim.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs text-slate-400">
                <div>
                  <dt className="font-semibold text-slate-200">
                    Pase
                  </dt>
                  <dd className="break-words">
                    {claim.battlePass.title} · T{claim.battlePass.seasonNumber}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-200">
                    Premio
                  </dt>
                  <dd className="break-words">
                    Nivel {claim.level.levelNumber} ·{" "}
                    {claim.level.manualRewardLabel || claim.level.title}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-200">
                    Reclamo
                  </dt>
                  <dd>{formatDate(claim.claimedAt)}</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => markAsDelivered(claim)}
                className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold uppercase text-white transition hover:bg-emerald-500"
              >
                <IoCheckmarkCircleOutline className="h-4 w-4" />
                Entregado
              </button>
            </article>
          ))}

          {deliveries.length === 0 && (
            <div className="rounded-xl border border-dashed border-tournament-dark-border p-5 text-center text-sm text-slate-400">
              No hay entregas en tienda pendientes para pases activos.
            </div>
          )}
        </div>

        <div className="hidden min-w-0 overflow-hidden rounded-xl border border-tournament-dark-border md:block">
          <table className="w-full table-fixed divide-y divide-tournament-dark-border text-sm">
            <thead className="bg-tournament-dark-muted text-left text-xs uppercase text-slate-300">
              <tr>
                <th className="px-3 py-2">Jugador</th>
                <th className="px-3 py-2">Pase activo</th>
                <th className="w-24 px-3 py-2">Nivel</th>
                <th className="px-3 py-2">Premio</th>
                <th className="w-28 px-3 py-2">Reclamo</th>
                <th className="w-32 px-3 py-2 text-right">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tournament-dark-border">
              {deliveries.map((claim) => (
                <tr key={claim.id}>
                  <td className="px-3 py-3">
                    <div className="truncate font-semibold text-white">
                      {claim.user.nickname || claim.user.email || "-"}
                    </div>
                    <div className="truncate text-xs text-slate-400">
                      {[claim.user.name, claim.user.lastname]
                        .filter(Boolean)
                        .join(" ") || "-"}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="truncate text-slate-200">
                      {claim.battlePass.title}
                    </div>
                    <div className="text-xs text-slate-400">
                      T{claim.battlePass.seasonNumber}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-300">
                    Nivel {claim.level.levelNumber}
                  </td>
                  <td className="truncate px-3 py-3 text-slate-300">
                    {claim.level.manualRewardLabel || claim.level.title}
                  </td>
                  <td className="px-3 py-3 text-slate-300">
                    {formatDate(claim.claimedAt)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => markAsDelivered(claim)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold uppercase text-white transition hover:bg-emerald-500"
                    >
                      <IoCheckmarkCircleOutline className="h-4 w-4" />
                      Entregado
                    </button>
                  </td>
                </tr>
              ))}

              {deliveries.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center text-slate-400"
                  >
                    No hay entregas en tienda pendientes para pases activos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
