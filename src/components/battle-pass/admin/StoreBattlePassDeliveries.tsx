"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { IoSearchOutline } from "react-icons/io5";
import {
  fulfillStoreBattlePassDeliveriesAction,
  getStoreBattlePassDeliveriesAction,
  getStoreBattlePassDeliveryHistoryAction,
  type AdminBattlePassClaim,
} from "@/actions/battle-pass/admin-battle-pass.action";
import { BattlePassDeliveryGroups } from "./BattlePassDeliveryGroups";
import { useToastStore, useUIStore } from "@/store";
import { toAssetStorageUrl } from "@/utils/asset-path";

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "-";

const getRewardName = (claim: AdminBattlePassClaim) =>
  claim.level.manualRewardLabel || claim.level.title;

const getRewardImage = (claim: AdminBattlePassClaim) =>
  claim.level.imageUrl || claim.rewardAvatar?.imageUrl || "";

const HISTORY_PAGE_SIZE = 10;
const PENDING_GROUP_PAGE_SIZE = 5;

type DeliveryTab = "pending" | "history";

const matchesPlayerSearch = (claim: AdminBattlePassClaim, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [
    claim.user.name,
    claim.user.lastname,
    [claim.user.name, claim.user.lastname].filter(Boolean).join(" "),
    claim.user.nickname,
    claim.user.email,
  ].some((value) => value?.toLowerCase().includes(normalizedQuery));
};

export const StoreBattlePassDeliveries = () => {
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const showToast = useToastStore((state) => state.showToast);

  const [deliveries, setDeliveries] = useState<AdminBattlePassClaim[]>([]);
  const [history, setHistory] = useState<AdminBattlePassClaim[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<DeliveryTab>("pending");
  const [error, setError] = useState<string | null>(null);

  const loadDeliveries = useCallback(async () => {
    try {
      setError(null);
      showLoading("Cargando entregas en tienda...");
      const [nextDeliveries, nextHistory] = await Promise.all([
        getStoreBattlePassDeliveriesAction(),
        getStoreBattlePassDeliveryHistoryAction(),
      ]);
      setDeliveries(nextDeliveries);
      setHistory(nextHistory);
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

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const markSelectedAsDelivered = async (
    userId: string,
    claimIds: string[],
  ) => {
    try {
      showLoading("Marcando entregas...");
      await fulfillStoreBattlePassDeliveriesAction({ userId, claimIds });
      await loadDeliveries();
      showToast("Entregas marcadas como entregadas.", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "No se pudieron marcar entregas.",
        "error",
      );
      throw err;
    } finally {
      hideLoading();
    }
  };

  const filteredDeliveries = deliveries.filter((claim) =>
    matchesPlayerSearch(claim, debouncedSearchQuery),
  );
  const filteredHistory = history.filter((claim) =>
    matchesPlayerSearch(claim, debouncedSearchQuery),
  );

  const tabs: Array<{
    id: DeliveryTab;
    label: string;
    description: string;
    count: number;
  }> = [
    {
      id: "pending",
      label: "Pendientes",
      description: "Agrupadas por jugador para entregar todas o solo algunas.",
      count: filteredDeliveries.length,
    },
    {
      id: "history",
      label: "Historial de entregas",
      description: "Recompensas de tienda marcadas como entregadas.",
      count: filteredHistory.length,
    },
  ];
  const selectedTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="min-w-0 space-y-6 overflow-hidden">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface sm:p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Entregas en tienda
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Reclamos pendientes de recompensas fisicas de pases activos o
          finalizados.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar jugador"
            className="w-full rounded-lg border border-tournament-dark-accent bg-white py-2 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500"
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {filteredDeliveries.length} pendiente
          {filteredDeliveries.length === 1 ? "" : "s"} ·{" "}
          {filteredHistory.length} entregada
          {filteredHistory.length === 1 ? "" : "s"}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface sm:p-5">
        <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-tournament-dark-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wide transition",
                activeTab === tab.id
                  ? "bg-purple-100 text-purple-700 dark:bg-[#3d225b] dark:text-[#edddf7]"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-[#251c2e] dark:hover:text-white",
              )}
            >
              {tab.label}
              <span
                className={clsx(
                  "rounded-md px-2 py-0.5 text-[11px]",
                  activeTab === tab.id
                    ? "bg-white/70 text-purple-700 dark:bg-white/10 dark:text-[#edddf7]"
                    : "bg-slate-100 text-slate-500 dark:bg-[#130a1c] dark:text-slate-400",
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {selectedTab.label}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedTab.description}
            </p>
          </div>
          <span
            className={clsx(
              "shrink-0 rounded-lg px-3 py-1 text-xs font-black uppercase",
              activeTab === "pending"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
            )}
          >
            {selectedTab.count}{" "}
            {activeTab === "pending" ? "pendientes" : "entregadas"}
          </span>
        </div>

        {activeTab === "pending" ? (
          <BattlePassDeliveryGroups
            claims={filteredDeliveries}
            emptyMessage="No hay entregas en tienda pendientes."
            pageSize={PENDING_GROUP_PAGE_SIZE}
            onDeliverClaims={markSelectedAsDelivered}
          />
        ) : (
          <DeliveryHistory claims={filteredHistory} />
        )}
      </section>
    </div>
  );
};

const DeliveryHistory = ({ claims }: { claims: AdminBattlePassClaim[] }) => {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(claims.length / HISTORY_PAGE_SIZE));
  const visibleClaims = claims.slice(
    (page - 1) * HISTORY_PAGE_SIZE,
    page * HISTORY_PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [claims.length]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  if (claims.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 dark:border-tournament-dark-border dark:text-slate-400">
        No hay entregas registradas para esta busqueda.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-tournament-dark-border">
        <div className="grid gap-2 p-3 md:hidden">
          {visibleClaims.map((claim) => (
          <article
            key={claim.id}
            className="rounded-xl bg-slate-50 p-3 dark:bg-tournament-dark-muted"
          >
            <div className="flex items-start gap-3">
              <RewardThumb claim={claim} />
              <div className="min-w-0">
                <h3 className="truncate text-sm font-black text-slate-900 dark:text-white">
                  {getRewardName(claim)}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Nivel {claim.level.levelNumber} - {claim.battlePass.title}
                </p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {claim.user.nickname || claim.user.email || "-"}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Entregado: {formatDate(claim.fulfilledAt)}
                </p>
              </div>
            </div>
          </article>
          ))}
        </div>

        <table className="hidden w-full table-fixed divide-y divide-slate-200 text-sm dark:divide-tournament-dark-border md:table">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-tournament-dark-muted dark:text-slate-300">
            <tr>
              <th className="w-[28%] px-3 py-2">Jugador</th>
              <th className="w-[30%] px-3 py-2">Recompensa</th>
              <th className="w-24 px-3 py-2">Nivel</th>
              <th className="px-3 py-2">Pase</th>
              <th className="w-32 px-3 py-2">Reclamo</th>
              <th className="w-32 px-3 py-2">Entrega</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-tournament-dark-border">
            {visibleClaims.map((claim) => (
              <tr key={claim.id}>
                <td className="px-3 py-3">
                  <div className="truncate font-semibold text-slate-900 dark:text-white">
                    {claim.user.nickname || claim.user.email || "-"}
                  </div>
                  <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {[claim.user.name, claim.user.lastname]
                      .filter(Boolean)
                      .join(" ") || "-"}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <RewardThumb claim={claim} />
                    <span className="truncate text-slate-700 dark:text-slate-200">
                      {getRewardName(claim)}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                  {claim.level.levelNumber}
                </td>
                <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                  <div className="truncate">{claim.battlePass.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    T{claim.battlePass.seasonNumber}
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                  {formatDate(claim.claimedAt)}
                </td>
                <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                  {formatDate(claim.fulfilledAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <PaginationControls
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      )}
    </>
  );
};

const PaginationControls = ({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-xs text-slate-500 dark:text-slate-400">
      Pagina {page} de {pageCount}
    </p>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-purple-400 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4d4354] dark:text-[#cfc2d6] dark:hover:text-white"
      >
        Anterior
      </button>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-purple-400 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4d4354] dark:text-[#cfc2d6] dark:hover:text-white"
      >
        Siguiente
      </button>
    </div>
  </div>
);

const RewardThumb = ({ claim }: { claim: AdminBattlePassClaim }) => {
  const image = getRewardImage(claim);

  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-200 dark:bg-[#130a1c]">
      {image ? (
        <Image
          src={toAssetStorageUrl(image)}
          alt={getRewardName(claim)}
          fill
          sizes="40px"
          className="object-cover object-center"
        />
      ) : (
        <span className="text-xs font-black text-slate-500 dark:text-[#ddb7ff]">
          SIX
        </span>
      )}
    </span>
  );
};
