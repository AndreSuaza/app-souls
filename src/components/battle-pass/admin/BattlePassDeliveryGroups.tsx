"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  IoCheckmarkCircleOutline,
  IoCloseOutline,
  IoGiftOutline,
} from "react-icons/io5";
import type { AdminBattlePassClaim } from "@/actions/battle-pass/admin-battle-pass.action";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { toAssetStorageUrl } from "@/utils/asset-path";

type Props = {
  claims: AdminBattlePassClaim[];
  emptyMessage?: string;
  pageSize?: number;
  onDeliverClaims: (userId: string, claimIds: string[]) => Promise<void>;
};

type ClaimGroup = {
  user: AdminBattlePassClaim["user"];
  claims: AdminBattlePassClaim[];
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const getRewardName = (claim: AdminBattlePassClaim) =>
  claim.level.manualRewardLabel || claim.level.title;

const getRewardImage = (claim: AdminBattlePassClaim) =>
  claim.level.imageUrl || claim.rewardAvatar?.imageUrl || "";

export const BattlePassDeliveryGroups = ({
  claims,
  emptyMessage = "No hay entregas en tienda pendientes.",
  pageSize = 6,
  onDeliverClaims,
}: Props) => {
  const [activeGroup, setActiveGroup] = useState<ClaimGroup | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);

  useBodyScrollLock(Boolean(activeGroup));

  const groups = useMemo(() => {
    const grouped = new Map<string, ClaimGroup>();

    for (const claim of claims) {
      const key = claim.user.id;
      const current = grouped.get(key);

      if (current) {
        current.claims.push(claim);
      } else {
        grouped.set(key, {
          user: claim.user,
          claims: [claim],
        });
      }
    }

    return Array.from(grouped.values()).sort((a, b) => {
      const nameA = a.user.nickname || a.user.email || "";
      const nameB = b.user.nickname || b.user.email || "";
      return nameA.localeCompare(nameB);
    });
  }, [claims]);

  const pageCount = Math.max(1, Math.ceil(groups.length / pageSize));
  const visibleGroups = groups.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [groups.length, pageSize]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const openGroup = (group: ClaimGroup) => {
    setActiveGroup(group);
    setSelectedIds(group.claims.map((claim) => claim.id));
  };

  const closeGroup = () => {
    if (isSubmitting) return;
    setActiveGroup(null);
    setSelectedIds([]);
  };

  const toggleClaim = (claimId: string) => {
    setSelectedIds((current) =>
      current.includes(claimId)
        ? current.filter((id) => id !== claimId)
        : [...current, claimId],
    );
  };

  const deliverSelected = async () => {
    if (!activeGroup || selectedIds.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onDeliverClaims(activeGroup.user.id, selectedIds);
      setActiveGroup(null);
      setSelectedIds([]);
    } catch {
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 dark:border-tournament-dark-border dark:text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3">
        {visibleGroups.map((group) => {
          const displayName =
            group.user.nickname || group.user.email || "Jugador sin nombre";
          const fullName =
            [group.user.name, group.user.lastname].filter(Boolean).join(" ") ||
            group.user.email ||
            "-";

          return (
            <article
              key={group.user.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#4d4354]/70 dark:bg-[#251c2e]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black text-slate-900 dark:text-[#edddf7]">
                    {displayName}
                  </h3>
                  <p className="truncate text-xs text-slate-500 dark:text-[#cfc2d6]">
                    {fullName}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-200">
                    {group.claims.length} recompensa
                    {group.claims.length === 1 ? "" : "s"} pendiente
                    {group.claims.length === 1 ? "" : "s"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openGroup(group)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-black uppercase text-white transition hover:bg-emerald-500 dark:bg-[#00a572] dark:text-[#003824] dark:hover:bg-[#4edea3]"
                >
                  <IoCheckmarkCircleOutline className="h-4 w-4" />
                  Entregar recompensas
                </button>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {group.claims.slice(0, 6).map((claim) => (
                  <div
                    key={claim.id}
                    className="flex min-w-0 items-center gap-2 rounded-lg bg-white p-2 text-xs text-slate-600 dark:bg-[#130a1c] dark:text-[#cfc2d6]"
                  >
                    <RewardImage claim={claim} />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900 dark:text-white">
                        {getRewardName(claim)}
                      </p>
                      <p className="truncate">
                        Nivel {claim.level.levelNumber} -{" "}
                        {claim.battlePass.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      {pageCount > 1 && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pagina {page} de {pageCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-purple-400 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4d4354] dark:text-[#cfc2d6] dark:hover:text-white"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
              disabled={page === pageCount}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-purple-400 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4d4354] dark:text-[#cfc2d6] dark:hover:text-white"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {activeGroup && (
        <div className="fixed inset-0 z-[9997] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeGroup}
          />
          <div className="relative max-h-[88dvh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#4d4354] dark:bg-[#180f21]">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5 dark:border-[#4d4354]">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-[#4edea3]">
                  Entrega en tienda
                </p>
                <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  {activeGroup.user.nickname ||
                    activeGroup.user.email ||
                    "Jugador"}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-[#cfc2d6]">
                  Selecciona los objetos que vas a entregar ahora.
                </p>
              </div>
              <button
                type="button"
                onClick={closeGroup}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-[#cfc2d6] dark:hover:bg-[#302639] dark:hover:text-white"
              >
                <IoCloseOutline className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[52dvh] space-y-2 overflow-y-auto p-5">
              {activeGroup.claims.map((claim) => {
                const checked = selectedIds.includes(claim.id);

                return (
                  <label
                    key={claim.id}
                    className={clsx(
                      "grid cursor-pointer grid-cols-[auto_52px_minmax(0,1fr)] items-center gap-3 rounded-xl border p-3 transition",
                      checked
                        ? "border-emerald-400 bg-emerald-50 dark:border-[#4edea3]/60 dark:bg-emerald-500/10"
                        : "border-slate-200 bg-slate-50 dark:border-[#4d4354] dark:bg-[#21182a]",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleClaim(claim.id)}
                      className="h-4 w-4 accent-emerald-500"
                    />
                    <RewardImage claim={claim} size="large" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                        {getRewardName(claim)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-[#cfc2d6]">
                        Nivel {claim.level.levelNumber} -{" "}
                        {claim.battlePass.title} T
                        {claim.battlePass.seasonNumber}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-[#988d9f]">
                        Reclamado el {formatDate(claim.claimedAt)}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end dark:border-[#4d4354]">
              <button
                type="button"
                onClick={closeGroup}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-purple-400 hover:text-purple-600 disabled:opacity-60 dark:border-[#4d4354] dark:text-[#cfc2d6] dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={deliverSelected}
                disabled={selectedIds.length === 0 || isSubmitting}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-black uppercase text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#00a572] dark:text-[#003824] dark:hover:bg-[#4edea3]"
              >
                Marcar seleccionadas
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const RewardImage = ({
  claim,
  size = "normal",
}: {
  claim: AdminBattlePassClaim;
  size?: "normal" | "large";
}) => {
  const image = getRewardImage(claim);
  const boxClassName = size === "large" ? "h-12 w-12" : "h-10 w-10";

  return (
    <span
      className={clsx(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#130a1c]",
        boxClassName,
      )}
    >
      {image ? (
        <Image
          src={toAssetStorageUrl(image)}
          alt={getRewardName(claim)}
          fill
          sizes={size === "large" ? "48px" : "40px"}
          className="object-cover object-center"
        />
      ) : (
        <IoGiftOutline className="h-5 w-5 text-[#ddb7ff]" />
      )}
    </span>
  );
};
