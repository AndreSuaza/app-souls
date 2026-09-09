"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  IoCheckmarkCircleOutline,
  IoGiftOutline,
  IoLockClosedOutline,
  IoStarOutline,
  IoTicketOutline,
} from "react-icons/io5";
import {
  claimBattlePassRewardAction,
  type ClaimBattlePassRewardResult,
  type PlayerBattlePassData,
  type PlayerBattlePassLevel,
} from "@/actions/battle-pass/player-battle-pass.action";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import { toAssetStorageUrl } from "@/utils/asset-path";

type Props = {
  initialData: PlayerBattlePassData | null;
  onClaim: (result: ClaimBattlePassRewardResult) => void;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const rewardLabel = (level: PlayerBattlePassLevel) => {
  if (level.rewardType === "PV") {
    return `${level.victoryPointsReward ?? 0} PV`;
  }

  if (level.rewardType === "MANUAL") {
    return level.manualRewardLabel ?? "Premio manual";
  }

  return level.rewardAvatar?.name ?? level.title;
};

const getRewardImage = (level: PlayerBattlePassLevel) =>
  level.imageUrl || level.rewardAvatar?.imageUrl || "";

export const ProfileBattlePassSection = ({ initialData, onClaim }: Props) => {
  const [data, setData] = useState(initialData);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(() => {
    const levels = initialData?.levels ?? [];
    return (
      levels.find((level) => level.levelNumber === initialData?.progress)?.id ??
      levels.find((level) => !level.claimed && level.unlocked)?.id ??
      levels[0]?.id ??
      null
    );
  });
  const activeLevelRef = useRef<HTMLButtonElement | null>(null);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const showToast = useToastStore((state) => state.showToast);
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    const levels = data?.levels ?? [];
    if (levels.length === 0) {
      setSelectedLevelId(null);
      return;
    }

    const stillExists = levels.some((level) => level.id === selectedLevelId);
    if (stillExists) return;

    setSelectedLevelId(
      levels.find((level) => level.levelNumber === data?.progress)?.id ??
        levels.find((level) => !level.claimed && level.unlocked)?.id ??
        levels[0]?.id ??
        null,
    );
  }, [data, selectedLevelId]);

  useEffect(() => {
    activeLevelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [data?.progress]);

  const selectedLevel = useMemo(() => {
    const levels = data?.levels ?? [];
    return (
      levels.find((level) => level.id === selectedLevelId) ?? levels[0] ?? null
    );
  }, [data, selectedLevelId]);

  const nextReward = data?.levels.find(
    (level) => level.unlocked && !level.claimed,
  );
  const progressPercent =
    data && data.maxLevel > 0
      ? Math.min(100, Math.round((data.progress / data.maxLevel) * 100))
      : 0;

  const handleClaim = (level: PlayerBattlePassLevel) => {
    if (!level.unlocked || level.claimed) return;

    // TODO: pedir tienda frecuente en la futura vista dedicada del pase antes de permitir reclamos.
    openConfirmation({
      text: "Reclamar recompensa",
      description: `Vas a reclamar "${rewardLabel(level)}".`,
      action: async () => {
        try {
          showLoading("Reclamando recompensa...");
          const result = await claimBattlePassRewardAction({
            levelId: level.id,
          });

          setData((current) => {
            if (!current) return current;
            return {
              ...current,
              victoryPoints: result.victoryPoints,
              levels: current.levels.map((item) =>
                item.id === result.levelId
                  ? {
                      ...item,
                      claimed: true,
                      claimStatus: result.claimStatus,
                    }
                  : item,
              ),
            };
          });
          onClaim(result);
          showToast(
            result.claimStatus === "PENDING_FULFILLMENT"
              ? "Recompensa registrada para entrega manual."
              : "Recompensa reclamada correctamente.",
            "success",
          );
          return true;
        } catch (error) {
          showToast(
            error instanceof Error
              ? error.message
              : "No se pudo reclamar la recompensa.",
            "error",
          );
          return false;
        } finally {
          hideLoading();
        }
      },
      onError: () => {
        hideLoading();
      },
    });
  };

  if (!data) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <IoTicketOutline className="mx-auto h-10 w-10 text-purple-500" />
        <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
          No hay pase activo
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
          Cuando el administrador active un pase de batalla, tu progreso por
          torneos finalizados aparecera aqui.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6 text-slate-900 dark:text-white">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-lg dark:border-tournament-dark-border">
        <div className="grid gap-5 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.28),transparent_38%),linear-gradient(135deg,#111827,#3f1117_52%,#0f172a)] p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
              Temporada {data.seasonNumber}
            </p>
            <h3 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
              {data.title}
            </h3>
            {data.description && (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200">
                {data.description}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-200">
              <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2">
                {formatDate(data.startsAt)} - {formatDate(data.endsAt)}
              </span>
              <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2">
                Progreso {data.progress}/{data.maxLevel}
              </span>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/15 bg-black/25 p-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-200">
                PV disponibles
              </p>
              <p className="mt-2 text-3xl font-black text-amber-100">
                {data.victoryPoints}
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-cyan-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-300">
              {nextReward
                ? `Recompensa lista: ${rewardLabel(nextReward)}`
                : "No hay recompensas pendientes listas."}
            </p>
          </div>
        </div>
      </div>

      {selectedLevel && (
        <article className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface lg:grid-cols-[220px_minmax(0,1fr)_auto]">
          <div className="flex min-h-44 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-tournament-dark-muted">
            {getRewardImage(selectedLevel) ? (
              <Image
                src={toAssetStorageUrl(getRewardImage(selectedLevel))}
                alt={selectedLevel.title}
                width={420}
                height={280}
                className="h-full max-h-56 w-full object-contain p-3"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-amber-300 bg-amber-100 text-2xl font-black text-amber-800">
                PV
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-600 dark:bg-tournament-dark-muted dark:text-slate-200">
                Nivel {selectedLevel.levelNumber}
              </span>
              <span
                className={clsx(
                  "rounded-lg px-3 py-1 text-xs font-black uppercase",
                  selectedLevel.claimed
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"
                    : selectedLevel.unlocked
                      ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-200"
                      : "bg-slate-100 text-slate-500 dark:bg-tournament-dark-muted dark:text-slate-300",
                )}
              >
                {selectedLevel.claimed
                  ? selectedLevel.claimStatus === "PENDING_FULFILLMENT"
                    ? "Pendiente"
                    : "Reclamado"
                  : selectedLevel.unlocked
                    ? "Disponible"
                    : "Bloqueado"}
              </span>
            </div>
            <h4 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              {selectedLevel.title}
            </h4>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {selectedLevel.description || rewardLabel(selectedLevel)}
            </p>
          </div>

          <div className="flex items-end lg:items-center">
            <button
              type="button"
              onClick={() => handleClaim(selectedLevel)}
              disabled={!selectedLevel.unlocked || selectedLevel.claimed}
              className={clsx(
                "inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black uppercase tracking-wide transition lg:w-auto",
                selectedLevel.claimed
                  ? "cursor-default border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                  : selectedLevel.unlocked
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20 hover:bg-purple-500"
                    : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-500",
              )}
            >
              {selectedLevel.claimed ? (
                <IoCheckmarkCircleOutline className="h-5 w-5" />
              ) : selectedLevel.unlocked ? (
                <IoGiftOutline className="h-5 w-5" />
              ) : (
                <IoLockClosedOutline className="h-5 w-5" />
              )}
              {selectedLevel.claimed ? "Reclamado" : "Reclamar"}
            </button>
          </div>
        </article>
      )}

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface md:block">
        <div className="flex min-w-max items-center gap-4 px-2 py-3">
          {data.levels.map((level, index) => {
            const image = getRewardImage(level);
            const isSelected = selectedLevelId === level.id;
            const isProgressLevel = level.levelNumber === data.progress;
            return (
              <div key={level.id} className="flex items-center gap-4">
                <button
                  ref={isProgressLevel ? activeLevelRef : undefined}
                  type="button"
                  onClick={() => setSelectedLevelId(level.id)}
                  className={clsx(
                    "group relative grid w-36 gap-2 rounded-xl border p-3 text-center transition",
                    isSelected
                      ? "border-cyan-300 bg-cyan-50 shadow-md dark:border-cyan-400 dark:bg-cyan-500/10"
                      : level.unlocked
                        ? "border-slate-200 bg-slate-50 hover:border-purple-300 dark:border-tournament-dark-border dark:bg-tournament-dark-muted"
                        : "border-slate-200 bg-slate-100 opacity-75 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/60",
                  )}
                >
                  <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-300">
                    Nivel {level.levelNumber}
                  </span>
                  <span className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
                    {image ? (
                      <Image
                        src={toAssetStorageUrl(image)}
                        alt={level.title}
                        width={96}
                        height={96}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <IoStarOutline className="h-8 w-8 text-amber-500" />
                    )}
                  </span>
                  <span className="line-clamp-2 min-h-9 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {rewardLabel(level)}
                  </span>
                  {level.claimed && (
                    <IoCheckmarkCircleOutline className="absolute right-2 top-2 h-5 w-5 text-emerald-500" />
                  )}
                </button>
                {index < data.levels.length - 1 && (
                  <span className="h-1 w-10 rounded-full bg-slate-200 dark:bg-tournament-dark-border" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {data.levels.map((level) => {
          const image = getRewardImage(level);
          return (
            <button
              key={level.id}
              type="button"
              onClick={() => setSelectedLevelId(level.id)}
              className={clsx(
                "grid w-full grid-cols-[56px_minmax(0,1fr)_32px] items-center gap-3 rounded-2xl border p-3 text-left",
                selectedLevelId === level.id
                  ? "border-cyan-300 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-500/10"
                  : "border-slate-200 bg-white dark:border-tournament-dark-border dark:bg-tournament-dark-surface",
              )}
            >
              <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-tournament-dark-muted">
                {image ? (
                  <Image
                    src={toAssetStorageUrl(image)}
                    alt={level.title}
                    width={72}
                    height={72}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <IoStarOutline className="h-6 w-6 text-amber-500" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400">
                  Nivel {level.levelNumber}
                </span>
                <span className="mt-1 block truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {rewardLabel(level)}
                </span>
              </span>
              <span className="justify-self-end">
                {level.claimed ? (
                  <IoCheckmarkCircleOutline className="h-6 w-6 text-emerald-500" />
                ) : level.unlocked ? (
                  <IoGiftOutline className="h-6 w-6 text-purple-500" />
                ) : (
                  <IoLockClosedOutline className="h-6 w-6 text-slate-400" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
