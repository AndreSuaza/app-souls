"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { BattlePassPlayerSearch } from "./BattlePassPlayerSearch";
import { BattlePassDeliveryGroups } from "./BattlePassDeliveryGroups";
import {
  adjustAdminBattlePassPlayerProgressAction,
  getAdminBattlePassPlayersAction,
  fulfillStoreBattlePassDeliveriesAction,
  type AdminBattlePassPlayerProgress,
  type AdminBattlePassPlayersResult,
} from "@/actions/battle-pass/admin-battle-pass.action";
import { PaginationLine } from "@/components/ui/pagination/paginationLine";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";

type BattlePassPlayersPanelProps = {
  battlePassId: string | null;
};

const panelClassName =
  "rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#4d4354]/70 dark:bg-[#251c2e] dark:shadow-[0_18px_40px_rgba(0,0,0,0.22)]";
const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-[#4d4354] dark:bg-[#130a1c] dark:text-[#edddf7] dark:placeholder:text-[#988d9f] dark:focus:border-[#ddb7ff]";

const EMPTY_RESULT: AdminBattlePassPlayersResult = {
  items: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  perPage: 20,
};

const formatDate = (value: string | null) => {
  if (!value) return "Sin ajustes";

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const getUserLabel = (item: AdminBattlePassPlayerProgress) => {
  const fullName = [item.user.name, item.user.lastname].filter(Boolean).join(" ");
  return fullName || item.user.nickname;
};

export const BattlePassPlayersPanel = ({
  battlePassId,
}: BattlePassPlayersPanelProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const showToast = useToastStore((state) => state.showToast);
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const [result, setResult] = useState<AdminBattlePassPlayersResult>(
    EMPTY_RESULT,
  );
  const requestRef = useRef(0);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlayers = useCallback(async () => {
    const request = ++requestRef.current;
    if (!battlePassId) {
      setResult(EMPTY_RESULT);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextResult = await getAdminBattlePassPlayersAction({
        battlePassId,
        page,
        query,
        perPage: 20,
      });
      if (request !== requestRef.current) return;
      setResult(nextResult);
      if (nextResult.currentPage !== page) {
        setPage(nextResult.currentPage);
      }
    } catch (loadError) {
      if (request !== requestRef.current) return;
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar el progreso de los jugadores.",
      );
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }, [battlePassId, page, query]);

  useEffect(() => {
    void loadPlayers();
    return () => { requestRef.current += 1; };
  }, [loadPlayers]);

  const searchPlayers = useCallback((value: string) => {
    setQuery(value);
    setPage(1);
  }, []);

  const deliverRewards = async (userId: string, levelIds: string[]) => {
    try {
      showLoading("Registrando entrega...");
      const delivered = await fulfillStoreBattlePassDeliveriesAction({ userId, levelIds });
      requestRef.current += 1;
      setResult((current) => ({
        ...current,
        items: current.items.map((item) => item.user.id !== userId ? item : ({
          ...item,
          claimedLevels: item.claimedLevels + delivered.newlyClaimedLevelIds.length,
          pendingDeliveries: item.pendingDeliveries.filter((reward) => !delivered.levelIds.includes(reward.level.id)),
        })),
      }));
      showToast("Recompensas entregadas.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo registrar la entrega.", "error");
      throw error;
    } finally {
      hideLoading();
    }
  };

  const requestAdjustment = (item: AdminBattlePassPlayerProgress, amount: 1 | -1) => {
    if (!battlePassId) return;

    const normalizedReason = reason.trim();
    if (normalizedReason.length < 5) {
      showToast("Escribe un motivo de al menos 5 caracteres.", "error");
      return;
    }

    const direction = amount > 0 ? "aumentar" : "disminuir";
    openConfirmation({
      text: `${direction === "aumentar" ? "Aumentar" : "Disminuir"} un escalón`,
      description: `${getUserLabel(item)} tiene progreso efectivo ${item.effectiveProgress}. Se aplicará un ajuste de ${amount > 0 ? "+1" : "-1"}. Motivo: ${normalizedReason}`,
      action: async () => {
        showLoading("Actualizando progreso del jugador...");

        try {
          await adjustAdminBattlePassPlayerProgressAction({
            battlePassId,
            userId: item.user.id,
            amount,
            reason: normalizedReason,
          });
          await loadPlayers();
          showToast("Progreso del jugador actualizado.", "success");
          return true;
        } catch (adjustmentError) {
          showToast(
            adjustmentError instanceof Error
              ? adjustmentError.message
              : "No se pudo actualizar el progreso.",
            "error",
          );
          return false;
        } finally {
          hideLoading();
        }
      },
    });
  };

  return (
    <section className={`${panelClassName} min-w-0 p-4 lg:p-5`}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#edddf7]">
              Progreso por jugador
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-[#cfc2d6]">
              Ajusta un escalón sin reemplazar el progreso obtenido en torneos.
            </p>
          </div>
          <div className="w-full lg:max-w-sm">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[#988d9f]">
              Buscar jugador
            </label>
            <BattlePassPlayerSearch onSearch={searchPlayers} />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-[#4d4354]/70 dark:bg-[#21182a]">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[#988d9f]">
            Motivo obligatorio
          </label>
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Ej. Corrección por torneo registrado fuera de tiempo"
            className={inputClassName}
            maxLength={240}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-[#93000a] dark:bg-[#93000a]/20 dark:text-[#ffb4ab]">
            {error}
          </div>
        )}

        {!battlePassId ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600 dark:border-[#4d4354] dark:text-[#cfc2d6]">
            Selecciona un pase para administrar el progreso de sus jugadores.
          </div>
        ) : loading ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600 dark:border-[#4d4354] dark:text-[#cfc2d6]">
            Cargando jugadores...
          </div>
        ) : result.items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#4d4354] p-5 text-sm text-[#cfc2d6]">
            No se encontraron jugadores con esa búsqueda.
          </div>
        ) : (
          <div className="grid gap-3">
            {result.items.map((item) => (
              <article
                key={item.user.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#4d4354]/70 dark:bg-[#21182a]"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900 dark:text-[#edddf7]">
                      {getUserLabel(item)}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-[#988d9f]">
                      @{item.user.nickname} · {item.user.email ?? "Sin email"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-[#988d9f]">
                      Último ajuste: {formatDate(item.lastAdjustmentAt)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 xl:ml-auto xl:min-w-[520px]">
                    <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-[#302639]">
                      <span className="block text-slate-500 dark:text-[#988d9f]">Torneos</span>
                      <strong className="text-base text-slate-900 dark:text-[#edddf7]">
                        {item.automaticProgress}
                      </strong>
                    </div>
                    <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-[#302639]">
                      <span className="block text-slate-500 dark:text-[#988d9f]">Ajuste</span>
                      <strong className="text-base text-purple-700 dark:text-[#ddb7ff]">
                        {item.manualOffset > 0 ? "+" : ""}
                        {item.manualOffset}
                      </strong>
                    </div>
                    <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-[#302639]">
                      <span className="block text-slate-500 dark:text-[#988d9f]">Efectivo</span>
                      <strong className="text-base text-emerald-700 dark:text-[#4edea3]">
                        {item.effectiveProgress}/{item.maxLevel}
                      </strong>
                    </div>
                    <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-[#302639]">
                      <span className="block text-slate-500 dark:text-[#988d9f]">Reclamados</span>
                      <strong className="text-base text-slate-900 dark:text-[#edddf7]">
                        {item.claimedLevels}
                      </strong>
                    </div>
                  </div>

                  {item.claimedLockedLevels > 0 && (
                    <p className="text-xs text-purple-700 xl:max-w-[210px] dark:text-[#ddb7ff]">
                      {item.claimedLockedLevels} recompensa(s) reclamada(s) están
                      fuera del progreso actual; no se revierte ninguna entrega.
                    </p>
                  )}

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => requestAdjustment(item, -1)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 dark:border-[#7b3f58] dark:text-[#ffb4ab] dark:hover:bg-[#93000a]/30"
                    >
                      − escalón
                    </button>
                    <button
                      type="button"
                      onClick={() => requestAdjustment(item, 1)}
                      className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-purple-700 dark:bg-[#7c03d3] dark:text-[#edddf7] dark:hover:bg-[#b76dff] dark:hover:text-[#400071]"
                    >
                      + escalón
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-[#edddf7]">Recompensas físicas por entregar</h3>
                  <BattlePassDeliveryGroups
                    claims={item.pendingDeliveries}
                    emptyMessage="No hay recompensas físicas pendientes en el nivel actual."
                    onDeliverClaims={deliverRewards}
                  />
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-[#988d9f]">
          <span>
            {result.totalCount} jugadores · Página {result.currentPage} de {result.totalPages}
          </span>
          <PaginationLine
            totalPages={result.totalPages}
            currentPage={result.currentPage}
            searchParams={searchParams}
            pathname={pathname}
            onPageChange={setPage}
            className="mt-0 mb-0 sm:justify-end"
          />
        </div>
      </div>
    </section>
  );
};
