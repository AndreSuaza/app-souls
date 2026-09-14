"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  IoArrowBackOutline,
  IoCheckmarkCircleOutline,
  IoGiftOutline,
  IoLockClosedOutline,
  IoSparklesOutline,
  IoStarOutline,
  IoTicketOutline,
} from "react-icons/io5";
import {
  claimAllBattlePassRewardsAction,
  claimBattlePassRewardAction,
  syncEndedBattlePassRewardsAction,
  type ClaimBattlePassRewardResult,
  type PlayerBattlePassData,
  type PlayerBattlePassLevel,
  type SyncedBattlePassReward,
} from "@/actions/battle-pass/player-battle-pass.action";
import { BattlePassSyncedRewardsOverlay } from "@/components/battle-pass/BattlePassSyncedRewardsOverlay";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import { toAssetStorageUrl } from "@/utils/asset-path";

type Props = {
  initialData: PlayerBattlePassData | null;
  onClaim?: (result: ClaimBattlePassRewardResult) => void;
  showBackLink?: boolean;
  variant?: "dedicated" | "embedded";
  enableClaims?: boolean;
  runAutoSync?: boolean;
};

const BATTLE_PASS_PV_IMAGE = "/battle-pass/victory-points.png";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("es-CO").format(value);

const rewardTypeLabels: Record<PlayerBattlePassLevel["rewardType"], string> = {
  AVATAR: "Avatar",
  BANNER: "Banner",
  PV: "PV",
  MANUAL: "Entrega en tienda",
};

const rewardLabel = (level: PlayerBattlePassLevel) => {
  if (level.rewardType === "PV") {
    return `${level.victoryPointsReward ?? 0} PV`;
  }

  if (level.rewardType === "MANUAL") {
    return level.manualRewardLabel ?? "Entrega en tienda";
  }

  return level.rewardAvatar?.name ?? level.title;
};

const getRewardImage = (level: PlayerBattlePassLevel) => {
  if (level.rewardType === "PV") return BATTLE_PASS_PV_IMAGE;
  return level.imageUrl || level.rewardAvatar?.imageUrl || "";
};

const getCappedProgress = (data: PlayerBattlePassData | null) =>
  data && data.maxLevel > 0
    ? Math.min(Math.max(0, data.progress), data.maxLevel)
    : 0;

type RewardOverlayState = {
  rewards: SyncedBattlePassReward[];
  eyebrow: string;
  title: string;
  description: string;
};

const getStatusIcon = (level: PlayerBattlePassLevel) => {
  if (level.claimed) return IoCheckmarkCircleOutline;
  if (level.unlocked) return IoGiftOutline;
  return IoLockClosedOutline;
};

const getFrameClassName = (level: PlayerBattlePassLevel, selected = false) =>
  clsx(
    "relative bg-[#130a1c] transition duration-200",
    selected && "scale-[1.03]",
    level.rewardType === "AVATAR" &&
      "border border-[#b76dff] shadow-[0_0_24px_rgba(183,109,255,0.28)]",
    level.rewardType === "BANNER" &&
      "border border-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.24)]",
    level.rewardType === "PV" && "shadow-[0_0_24px_rgba(251,191,36,0.18)]",
    level.rewardType === "MANUAL" && "shadow-[0_0_24px_rgba(78,222,163,0.16)]",
  );

const getBadgeClassName = (level: PlayerBattlePassLevel) =>
  clsx(
    "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em]",
    level.rewardType === "AVATAR" &&
      "border-[#b76dff]/50 bg-[#7c03d3]/20 text-[#ddb7ff]",
    level.rewardType === "BANNER" &&
      "border-cyan-300/50 bg-cyan-500/15 text-cyan-100",
    level.rewardType === "PV" &&
      "border-amber-300/50 bg-amber-500/15 text-amber-100",
    level.rewardType === "MANUAL" &&
      "border-[#4edea3]/50 bg-emerald-500/15 text-[#4edea3]",
  );

const RewardClaimPreview = ({ level }: { level: PlayerBattlePassLevel }) => {
  const image = getRewardImage(level);

  return (
    <div className="mx-auto grid max-w-[17rem] justify-items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
      <div
        className={clsx(
          "relative flex items-center justify-center overflow-hidden bg-[#130a1c]",
          level.rewardType === "BANNER"
            ? "h-24 w-full rounded-lg"
            : level.rewardType === "AVATAR"
              ? "h-24 w-24 rounded-full"
              : "h-24 w-24 rounded-xl",
        )}
      >
        {image ? (
          <Image
            src={toAssetStorageUrl(image)}
            alt={rewardLabel(level)}
            fill
            sizes="272px"
            className={clsx(
              level.rewardType === "PV"
                ? "object-contain p-2"
                : "object-cover object-center",
            )}
          />
        ) : (
          <IoGiftOutline className="h-10 w-10 text-[#ddb7ff]" />
        )}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 dark:text-[#ddb7ff]">
          Nivel {level.levelNumber}
        </p>
        <h4 className="mt-1 text-base font-black text-slate-900 dark:text-white">
          {rewardLabel(level)}
        </h4>
        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
          {rewardTypeLabels[level.rewardType]}
        </p>
      </div>
    </div>
  );
};

export const ProfileBattlePassSection = ({
  initialData,
  onClaim,
  showBackLink = false,
  variant = "dedicated",
  enableClaims = true,
  runAutoSync = true,
}: Props) => {
  const [data, setData] = useState(initialData);
  const [fixedLevelId, setFixedLevelId] = useState<string | null>(() => {
    const levels = initialData?.levels ?? [];
    const initialProgress = getCappedProgress(initialData);
    return (
      levels.find((level) => level.levelNumber === initialProgress)?.id ??
      levels.find((level) => !level.claimed && level.unlocked)?.id ??
      levels[0]?.id ??
      null
    );
  });
  const activeLevelRef = useRef<HTMLButtonElement | null>(null);
  const timelineScrollRef = useRef<HTMLDivElement | null>(null);
  const [claimedRewardLevel, setClaimedRewardLevel] =
    useState<PlayerBattlePassLevel | null>(null);
  const [rewardOverlay, setRewardOverlay] = useState<RewardOverlayState>({
    rewards: [],
    eyebrow: "Recompensas entregadas",
    title: "Pase finalizado",
    description:
      "Se entregaron automaticamente las recompensas pendientes que habias desbloqueado.",
  });
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
    if (!runAutoSync) return;

    let isMounted = true;

    syncEndedBattlePassRewardsAction()
      .then((result) => {
        if (!isMounted) return;
        if (result.awardedPv > 0) {
          setData((current) =>
            current
              ? {
                  ...current,
                  victoryPoints: current.victoryPoints + result.awardedPv,
                }
              : current,
          );
        }
        if (result.rewards.length > 0) {
          setRewardOverlay({
            rewards: result.rewards,
            eyebrow: "Recompensas entregadas",
            title: "Pase finalizado",
            description:
              "Se entregaron automaticamente las recompensas pendientes que habias desbloqueado.",
          });
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [runAutoSync]);

  useEffect(() => {
    if (variant !== "dedicated") return;

    document.body.classList.toggle(
      "has-active-battle-pass-view",
      Boolean(data),
    );

    return () => {
      document.body.classList.remove("has-active-battle-pass-view");
    };
  }, [data, variant]);

  useEffect(() => {
    const levels = data?.levels ?? [];
    if (levels.length === 0) {
      setFixedLevelId(null);
      return;
    }

    const stillExists = levels.some((level) => level.id === fixedLevelId);
    if (stillExists) return;
    const cappedProgress = getCappedProgress(data);

    setFixedLevelId(
      levels.find((level) => level.levelNumber === cappedProgress)?.id ??
        levels.find((level) => !level.claimed && level.unlocked)?.id ??
        levels[0]?.id ??
        null,
    );
  }, [data, fixedLevelId]);

  useEffect(() => {
    activeLevelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [data?.progress, data?.levels.length]);

  useEffect(() => {
    if (!claimedRewardLevel) return;

    const timeoutId = window.setTimeout(() => {
      setClaimedRewardLevel(null);
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [claimedRewardLevel]);

  useEffect(() => {
    const container = timelineScrollRef.current;
    if (!container) return;

    const handleWheel = (event: globalThis.WheelEvent) => {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      if (maxScrollLeft <= 0) return;

      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;

      if (delta === 0) return;

      event.preventDefault();
      event.stopPropagation();
      container.scrollLeft = Math.max(
        0,
        Math.min(maxScrollLeft, container.scrollLeft + delta),
      );
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [data?.levels.length]);

  const selectedLevel = useMemo(() => {
    const levels = data?.levels ?? [];
    return (
      levels.find((level) => level.id === fixedLevelId) ?? levels[0] ?? null
    );
  }, [data, fixedLevelId]);
  const claimableLevels = useMemo(
    () =>
      data?.levels.filter((level) => level.unlocked && !level.claimed) ?? [],
    [data],
  );

  const cappedProgress = getCappedProgress(data);
  const progressPercent =
    data && data.maxLevel > 0
      ? Math.min(100, Math.round((cappedProgress / data.maxLevel) * 100))
      : 0;
  const currentLevelNumber =
    data && data.maxLevel > 0
      ? Math.min(Math.max(1, cappedProgress), data.maxLevel)
      : 0;

  const backgroundImage = data?.backgroundImageUrl
    ? toAssetStorageUrl(data.backgroundImageUrl)
    : "";

  const completeClaim = async (level: PlayerBattlePassLevel) => {
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
      onClaim?.(result);
      setFixedLevelId(result.levelId);
      setClaimedRewardLevel({
        ...level,
        claimed: true,
        claimStatus: result.claimStatus,
      });
      showToast(
        result.claimStatus === "PENDING_FULFILLMENT"
          ? "Recompensa registrada para entrega en tienda."
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
  };

  const handleClaimAll = async () => {
    if (!enableClaims || claimableLevels.length === 0) return;

    try {
      showLoading("Reclamando recompensas...");
      const result = await claimAllBattlePassRewardsAction();
      const rewardByLevelId = new Map(
        result.rewards.map((reward) => [reward.id, reward]),
      );

      setData((current) => {
        if (!current) return current;

        return {
          ...current,
          victoryPoints: result.victoryPoints,
          levels: current.levels.map((level) => {
            const claimedReward = rewardByLevelId.get(level.id);
            if (!claimedReward) return level;

            return {
              ...level,
              claimed: true,
              claimStatus: claimedReward.claimStatus,
            };
          }),
        };
      });

      const lastReward = result.rewards.at(-1);
      if (lastReward) {
        setFixedLevelId(lastReward.id);
      }

      setRewardOverlay({
        rewards: result.rewards,
        eyebrow: "Recompensas obtenidas",
        title: "Reclamo completado",
        description:
          "Estas recompensas ya quedaron registradas en tu cuenta. Las entregas en tienda quedan pendientes para el evento final.",
      });
      showToast("Recompensas reclamadas correctamente.", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudieron reclamar las recompensas.",
        "error",
      );
    } finally {
      hideLoading();
    }
  };

  const handleClaim = (level: PlayerBattlePassLevel) => {
    if (!enableClaims) return;
    if (!level.unlocked || level.claimed) return;

    if (level.rewardType !== "MANUAL") {
      void completeClaim(level);
      return;
    }

    openConfirmation({
      text: "Reclamar recompensa",
      description:
        "Todas las recompensas se entregarán en el evento de final del pase de batalla.",
      content: <RewardClaimPreview level={level} />,
      action: async () => {
        return completeClaim(level);
      },
      onError: () => {
        hideLoading();
      },
    });
  };

  if (!data) {
    return (
      <>
        <div className="flex min-h-[calc(100dvh-72px)] items-center justify-center px-4 py-10">
          <section className="w-full max-w-2xl rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
            <IoTicketOutline className="mx-auto h-10 w-10 text-purple-500" />
            <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
              No hay pase activo
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
              Cuando el administrador active un pase de batalla, tu progreso por
              torneos finalizados aparecera aqui.
            </p>
          </section>
        </div>
        <BattlePassSyncedRewardsOverlay
          rewards={rewardOverlay.rewards}
          eyebrow={rewardOverlay.eyebrow}
          title={rewardOverlay.title}
          description={rewardOverlay.description}
          onClose={() =>
            setRewardOverlay((current) => ({ ...current, rewards: [] }))
          }
        />
      </>
    );
  }

  if (data.levels.length === 0) {
    return (
      <>
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
          <IoSparklesOutline className="mx-auto h-10 w-10 text-purple-500" />
          <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
            Pase en preparacion
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            El pase ya esta activo, pero aun no tiene niveles configurados.
          </p>
        </section>
        <BattlePassSyncedRewardsOverlay
          rewards={rewardOverlay.rewards}
          eyebrow={rewardOverlay.eyebrow}
          title={rewardOverlay.title}
          description={rewardOverlay.description}
          onClose={() =>
            setRewardOverlay((current) => ({ ...current, rewards: [] }))
          }
        />
      </>
    );
  }

  const selectedImage = selectedLevel ? getRewardImage(selectedLevel) : "";
  const SelectedStatusIcon = selectedLevel
    ? getStatusIcon(selectedLevel)
    : IoLockClosedOutline;

  return (
    <section
      className={clsx(
        "relative isolate overflow-hidden bg-[#180f21] text-[#edddf7] shadow-2xl",
        variant === "dedicated"
          ? "min-h-[calc(100dvh-72px)]"
          : "min-h-[calc(100dvh-72px)]",
      )}
    >
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt=""
          fill
          sizes="(min-width: 1024px) 1100px, 100vw"
          priority
          className="-z-20 object-cover"
        />
      ) : (
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_15%,rgba(78,222,163,0.24),transparent_30%),radial-gradient(circle_at_74%_28%,rgba(124,3,211,0.32),transparent_32%),linear-gradient(135deg,#130a1c_0%,#1c1028_45%,#061a19_100%)]" />
      )}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(19,10,28,0.42)_0%,rgba(19,10,28,0.74)_52%,rgba(19,10,28,0.95)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-gradient-to-t from-[#130a1c] via-[#130a1c]/88 to-transparent" />

      <div className="flex min-h-[calc(100dvh-72px)] flex-col px-4 pb-4 pt-3 sm:px-6 lg:px-10 lg:pb-5 lg:pt-4">
        <div className="flex shrink-0 items-start justify-between gap-4">
          {showBackLink ? (
            <Link
              href="/perfil"
              className="inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-bold text-[#cfc2d6] transition hover:bg-white/5 hover:text-white"
            >
              <IoArrowBackOutline className="h-4 w-4" />
              Volver
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}

          <div className="flex max-w-sm items-center justify-end gap-3">
            <p className="max-w-[9rem] text-right text-[10px] font-semibold leading-4 text-[#cfc2d6] sm:max-w-[18rem] sm:text-[11px]">
              Estos puntos servirán para reclamar recompensas en el torneo
              nacional.
            </p>
            <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#130a1c]/55 px-3 py-2 shadow-lg shadow-purple-950/30 backdrop-blur">
              <span className="relative h-[35px] w-[35px]">
                <Image
                  src={BATTLE_PASS_PV_IMAGE}
                  alt="PV"
                  fill
                  sizes="35px"
                  className="object-contain"
                />
              </span>
              <span className="text-2xl font-black text-white">
                {formatNumber(data.victoryPoints)}
              </span>
            </div>
          </div>
        </div>

        {selectedLevel && (
          <section className="grid flex-1 gap-6 py-6 lg:grid-cols-[minmax(240px,0.9fr)_minmax(320px,1fr)_minmax(260px,0.85fr)] lg:items-center lg:gap-8 lg:py-8">
            <div className="min-w-0 self-center lg:pl-4 xl:pl-8">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#4edea3]">
                Temporada {data.seasonNumber}
              </p>
              <h2 className="mt-1 font-['Bebas_Neue'] text-4xl leading-none text-white drop-shadow sm:text-5xl lg:text-6xl">
                {data.title}
              </h2>
              {data.description && (
                <p className="mt-2 max-w-3xl text-sm leading-5 text-[#cfc2d6] lg:line-clamp-2">
                  {data.description}
                </p>
              )}
              <div className="mt-4 max-w-[14rem]">
                <div className="flex items-end gap-2">
                  <span className="font-['Bebas_Neue'] text-3xl leading-none text-white">
                    Nv.{currentLevelNumber}
                  </span>
                  <span className="font-mono text-sm font-bold text-[#4edea3]">
                    {formatNumber(cappedProgress)}
                  </span>
                  <span className="text-sm font-semibold text-[#988d9f]">
                    / {formatNumber(data.maxLevel)}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full border border-[#362348] bg-[#130a1c]/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4edea3] via-[#7c03d3] to-[#b76dff]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {enableClaims && (
                  <button
                    type="button"
                    onClick={handleClaimAll}
                    disabled={claimableLevels.length === 0}
                    className={clsx(
                      "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] transition",
                      claimableLevels.length > 0
                        ? "border-[#4edea3]/60 bg-gradient-to-r from-[#00a572] to-[#7c03d3] text-white shadow-[0_0_22px_rgba(78,222,163,0.28)] hover:from-[#13bf86] hover:to-[#8b05ea]"
                        : "cursor-not-allowed border-[#362348] bg-[#130a1c]/55 text-[#988d9f]",
                    )}
                  >
                    <IoSparklesOutline className="h-4 w-4" />
                    Reclamar todo
                    {claimableLevels.length > 0 && (
                      <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px]">
                        {claimableLevels.length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="relative flex min-h-[230px] w-full items-center justify-center sm:min-h-[280px]">
              <div
                className={clsx(
                  "relative overflow-hidden",
                  selectedLevel.rewardType === "BANNER"
                    ? "h-44 w-full max-w-[520px] rounded-2xl border border-cyan-200/65 shadow-[0_0_28px_rgba(34,211,238,0.18)] sm:h-56 lg:h-52"
                    : selectedLevel.rewardType === "AVATAR"
                      ? "h-56 w-56 rounded-full border border-[#ddb7ff]/70 shadow-[0_0_28px_rgba(183,109,255,0.22)] sm:h-72 sm:w-72 lg:h-64 lg:w-64"
                      : "h-56 w-56 sm:h-72 sm:w-72 lg:h-64 lg:w-64",
                )}
              >
                {selectedImage ? (
                  <Image
                    src={toAssetStorageUrl(selectedImage)}
                    alt={rewardLabel(selectedLevel)}
                    fill
                    sizes={
                      selectedLevel.rewardType === "BANNER" ? "520px" : "288px"
                    }
                    className={clsx(
                      selectedLevel.rewardType === "BANNER"
                        ? "rounded-2xl object-cover object-center"
                        : selectedLevel.rewardType === "AVATAR"
                          ? "rounded-full object-cover object-center"
                          : selectedLevel.rewardType === "PV"
                            ? "object-contain"
                            : "rounded-2xl object-contain",
                    )}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <IoGiftOutline className="h-24 w-24 text-[#ddb7ff]" />
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 self-center text-center lg:pr-4 lg:text-left xl:pr-8">
              <h3 className="font-['Bebas_Neue'] text-5xl leading-none text-white drop-shadow sm:text-6xl">
                {rewardLabel(selectedLevel)}
              </h3>
              <div className="mt-3 flex justify-center lg:justify-start">
                <span className={getBadgeClassName(selectedLevel)}>
                  {rewardTypeLabels[selectedLevel.rewardType]}
                </span>
              </div>
              {selectedLevel.description && (
                <p className="mt-4 max-w-md text-sm leading-6 text-[#cfc2d6]">
                  {selectedLevel.description}
                </p>
              )}

              {enableClaims ? (
                <button
                  type="button"
                  onClick={() => handleClaim(selectedLevel)}
                  disabled={!selectedLevel.unlocked || selectedLevel.claimed}
                  className={clsx(
                    "mt-6 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black uppercase tracking-wide transition",
                    selectedLevel.claimed
                      ? "cursor-default border border-[#4edea3]/40 bg-emerald-500/15 text-[#4edea3]"
                      : selectedLevel.unlocked
                        ? "border border-[#ddb7ff]/60 bg-gradient-to-r from-[#7c03d3] to-[#b76dff] text-white shadow-[0_0_25px_rgba(124,3,211,0.55)] hover:from-[#8b05ea] hover:to-[#c685ff]"
                        : "cursor-not-allowed border border-[#362348] bg-[#21182a] text-[#988d9f]",
                  )}
                >
                  <SelectedStatusIcon className="h-5 w-5" />
                  {selectedLevel.claimed ? "Reclamado" : "Reclamar"}
                </button>
              ) : (
                <Link
                  href="/perfil/pase-batalla"
                  className="mt-6 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-[#ddb7ff]/60 bg-gradient-to-r from-[#7c03d3] to-[#b76dff] px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_0_25px_rgba(124,3,211,0.45)] transition hover:from-[#8b05ea] hover:to-[#c685ff]"
                >
                  <IoGiftOutline className="h-5 w-5" />
                  Ver pase
                </Link>
              )}
            </div>
          </section>
        )}

        <section className="shrink-0 bg-transparent px-0 py-2 lg:px-4">
          <div className="relative block">
            <div
              ref={timelineScrollRef}
              className="w-full min-w-0 overflow-x-auto overflow-y-hidden pb-3 pt-1 scroll-smooth"
            >
              <div className="relative flex min-w-full w-max items-start justify-center gap-6 px-6 sm:gap-8 sm:px-8 md:gap-9">
                <div className="pointer-events-none absolute left-10 right-10 top-[104px] h-1.5 overflow-hidden rounded-full border border-[#362348] bg-[#130a1c]/80 md:left-12 md:right-12 md:top-[124px] md:h-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4edea3] via-[#7c03d3] to-[#b76dff] shadow-[0_0_14px_rgba(124,3,211,0.65)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {data.levels.map((level) => {
                  const image = getRewardImage(level);
                  const isSelected = selectedLevel?.id === level.id;
                  const isProgressLevel =
                    level.levelNumber === currentLevelNumber;
                  const StatusIcon = getStatusIcon(level);

                  return (
                    <button
                      key={level.id}
                      ref={isProgressLevel ? activeLevelRef : undefined}
                      type="button"
                      onClick={() => setFixedLevelId(level.id)}
                      onMouseEnter={() => setFixedLevelId(level.id)}
                      className="group grid w-[104px] shrink-0 justify-items-center pb-4 text-center outline-none md:w-[125px]"
                    >
                      <span
                        className={clsx(
                          getFrameClassName(level, isSelected),
                          "flex h-[82px] w-[82px] items-center justify-center rounded-xl md:h-[100px] md:w-[100px]",
                          isSelected &&
                            (level.rewardType === "AVATAR" ||
                              level.rewardType === "BANNER") &&
                            "ring-2 ring-[#ddb7ff]",
                        )}
                      >
                        {image ? (
                          <Image
                            src={toAssetStorageUrl(image)}
                            alt={rewardLabel(level)}
                            width={96}
                            height={96}
                            className={clsx(
                              "h-full w-full",
                              level.rewardType === "PV"
                                ? "object-contain p-2"
                                : "rounded-[inherit] object-cover object-center",
                            )}
                          />
                        ) : (
                          <IoStarOutline className="h-8 w-8 text-[#ddb7ff]" />
                        )}
                        {level.claimed && (
                          <span className="absolute right-1 top-1 rounded-full bg-[#130a1c]/85 p-1">
                            <IoCheckmarkCircleOutline className="h-3.5 w-3.5 text-[#4edea3] md:h-4 md:w-4" />
                          </span>
                        )}
                        {!level.claimed && level.unlocked && (
                          <span className="absolute right-1 top-1 rounded-full bg-[#130a1c]/85 p-1">
                            <IoGiftOutline className="h-3.5 w-3.5 text-[#ddb7ff] md:h-4 md:w-4" />
                          </span>
                        )}
                        {!level.claimed && !level.unlocked && (
                          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-amber-300/70 bg-[#130a1c]/95 p-1.5 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.35)]">
                            <StatusIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          </span>
                        )}
                      </span>
                      <span
                        className={clsx(
                          "mt-8 rounded-md border px-2 py-0.5 text-xs font-black md:mt-9 md:text-sm",
                          isSelected
                            ? "border-[#ddb7ff] bg-[#7c03d3]/35 text-white"
                            : "border-[#362348] bg-[#130a1c] text-[#988d9f]",
                        )}
                      >
                        {level.levelNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {claimedRewardLevel && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-6 backdrop-blur-sm"
        >
          <div className="w-full max-w-xs rounded-3xl border border-[#ddb7ff]/50 bg-[#180f21]/95 p-5 text-center shadow-[0_0_45px_rgba(124,3,211,0.55)]">
            <div className="mx-auto flex h-28 w-28 animate-bounce items-center justify-center">
              {getRewardImage(claimedRewardLevel) ? (
                <div className="relative h-28 w-28">
                  <Image
                    src={toAssetStorageUrl(getRewardImage(claimedRewardLevel))}
                    alt={rewardLabel(claimedRewardLevel)}
                    fill
                    sizes="112px"
                    className={clsx(
                      claimedRewardLevel.rewardType === "PV"
                        ? "object-contain"
                        : "rounded-2xl object-cover object-center",
                    )}
                  />
                </div>
              ) : (
                <IoGiftOutline className="h-20 w-20 text-[#ddb7ff]" />
              )}
            </div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.22em] text-[#4edea3]">
              Recompensa obtenida
            </p>
            <h3 className="mt-2 font-['Bebas_Neue'] text-4xl leading-none text-white">
              {rewardLabel(claimedRewardLevel)}
            </h3>
            <p className="mt-2 text-xs font-semibold text-[#cfc2d6]">
              {claimedRewardLevel.claimStatus === "PENDING_FULFILLMENT"
                ? "Registrada para entrega en tienda."
                : "Ya puedes usarla en tu perfil."}
            </p>
          </div>
        </div>
      )}
      <BattlePassSyncedRewardsOverlay
        rewards={rewardOverlay.rewards}
        eyebrow={rewardOverlay.eyebrow}
        title={rewardOverlay.title}
        description={rewardOverlay.description}
        onClose={() =>
          setRewardOverlay((current) => ({ ...current, rewards: [] }))
        }
      />
    </section>
  );
};
