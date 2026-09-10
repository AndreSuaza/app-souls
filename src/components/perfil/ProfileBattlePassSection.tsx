"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  IoArrowBackOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCheckmarkCircleOutline,
  IoGiftOutline,
  IoLockClosedOutline,
  IoSparklesOutline,
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
  onClaim?: (result: ClaimBattlePassRewardResult) => void;
  showBackLink?: boolean;
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

const getStatusLabel = (level: PlayerBattlePassLevel) => {
  if (level.claimed && level.claimStatus === "PENDING_FULFILLMENT") {
    return "En tienda";
  }

  if (level.claimed) return "Reclamado";
  if (level.unlocked) return "Disponible";
  return "Bloqueado";
};

const getStatusIcon = (level: PlayerBattlePassLevel) => {
  if (level.claimed) return IoCheckmarkCircleOutline;
  if (level.unlocked) return IoGiftOutline;
  return IoLockClosedOutline;
};

const getFrameClassName = (level: PlayerBattlePassLevel, selected = false) =>
  clsx(
    "relative border bg-[#130a1c] transition duration-200",
    selected && "scale-[1.03]",
    level.rewardType === "AVATAR" &&
      "border-[#b76dff] shadow-[0_0_24px_rgba(183,109,255,0.28)]",
    level.rewardType === "BANNER" &&
      "border-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.24)]",
    level.rewardType === "PV" &&
      "border-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.24)]",
    level.rewardType === "MANUAL" &&
      "border-[#4edea3] shadow-[0_0_24px_rgba(78,222,163,0.22)]",
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

export const ProfileBattlePassSection = ({
  initialData,
  onClaim,
  showBackLink = false,
}: Props) => {
  const [data, setData] = useState(initialData);
  const [fixedLevelId, setFixedLevelId] = useState<string | null>(() => {
    const levels = initialData?.levels ?? [];
    return (
      levels.find((level) => level.levelNumber === initialData?.progress)?.id ??
      levels.find((level) => !level.claimed && level.unlocked)?.id ??
      levels[0]?.id ??
      null
    );
  });
  const activeLevelRef = useRef<HTMLButtonElement | null>(null);
  const timelineScrollRef = useRef<HTMLDivElement | null>(null);
  const [claimedRewardLevel, setClaimedRewardLevel] =
    useState<PlayerBattlePassLevel | null>(null);
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
      setFixedLevelId(null);
      return;
    }

    const stillExists = levels.some((level) => level.id === fixedLevelId);
    if (stillExists) return;

    setFixedLevelId(
      levels.find((level) => level.levelNumber === data?.progress)?.id ??
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

  const selectedLevel = useMemo(() => {
    const levels = data?.levels ?? [];
    return (
      levels.find((level) => level.id === fixedLevelId) ??
      levels[0] ??
      null
    );
  }, [data, fixedLevelId]);

  const progressPercent =
    data && data.maxLevel > 0
      ? Math.min(100, Math.round((data.progress / data.maxLevel) * 100))
      : 0;
  const currentLevelNumber =
    data && data.maxLevel > 0
      ? Math.min(Math.max(1, data.progress), data.maxLevel)
      : 0;

  const backgroundImage = data?.backgroundImageUrl
    ? toAssetStorageUrl(data.backgroundImageUrl)
    : "";

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
      },
      onError: () => {
        hideLoading();
      },
    });
  };

  const scrollTimeline = (direction: -1 | 1) => {
    const container = timelineScrollRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction * Math.max(360, container.clientWidth * 0.72),
      behavior: "smooth",
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

  if (data.levels.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <IoSparklesOutline className="mx-auto h-10 w-10 text-purple-500" />
        <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
          Pase en preparacion
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
          El pase ya esta activo, pero aun no tiene niveles configurados.
        </p>
      </section>
    );
  }

  const selectedImage = selectedLevel ? getRewardImage(selectedLevel) : "";
  const SelectedStatusIcon = selectedLevel
    ? getStatusIcon(selectedLevel)
    : IoLockClosedOutline;

  return (
    <section className="relative isolate min-h-[calc(100dvh-72px)] overflow-hidden bg-[#180f21] text-[#edddf7] shadow-2xl">
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

          <button
            type="button"
            className="group relative inline-flex w-fit items-center gap-2 rounded-lg bg-[#130a1c]/55 px-3 py-2 text-left shadow-lg shadow-purple-950/30 outline-none backdrop-blur transition hover:bg-[#21182a]/75 focus-visible:ring-2 focus-visible:ring-[#b76dff]"
          >
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
            <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 hidden w-72 rounded-xl border border-[#362348] bg-[#130a1c]/95 p-3 text-xs font-semibold leading-5 text-[#cfc2d6] shadow-2xl shadow-purple-950/40 backdrop-blur group-hover:block group-focus:block">
              Estos puntos serviran para poder reclamar recompensas en futuras
              actualizaciones.
            </span>
          </button>
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
                  {formatNumber(data.progress)}
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
            </div>
            </div>

            <div className="relative flex min-h-[230px] w-full items-center justify-center sm:min-h-[280px]">
              <div
                className={clsx(
                  "relative",
                  selectedLevel.rewardType === "BANNER"
                    ? "h-44 w-full max-w-[520px] sm:h-56 lg:h-52"
                    : "h-56 w-56 sm:h-72 sm:w-72 lg:h-64 lg:w-64",
                )}
              >
                {selectedImage ? (
                  <Image
                    src={toAssetStorageUrl(selectedImage)}
                    alt={rewardLabel(selectedLevel)}
                    fill
                    sizes={
                      selectedLevel.rewardType === "BANNER"
                        ? "520px"
                        : "288px"
                    }
                    className={clsx(
                      selectedLevel.rewardType === "BANNER"
                        ? "rounded-2xl object-cover object-center"
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
            </div>
          </section>
        )}

        <section className="shrink-0 bg-transparent px-0 py-2 lg:px-4">
          <div className="relative hidden md:block">
            <button
              type="button"
              aria-label="Ver niveles anteriores"
              onClick={() => scrollTimeline(-1)}
              className="absolute left-0 top-[48px] z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#ddb7ff]/40 bg-[#130a1c]/85 text-[#ddb7ff] shadow-[0_0_18px_rgba(124,3,211,0.35)] backdrop-blur transition hover:border-[#ddb7ff] hover:bg-[#21182a]"
            >
              <IoChevronBackOutline className="h-6 w-6" />
            </button>

            <button
              type="button"
              aria-label="Ver niveles siguientes"
              onClick={() => scrollTimeline(1)}
              className="absolute right-0 top-[48px] z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#ddb7ff]/40 bg-[#130a1c]/85 text-[#ddb7ff] shadow-[0_0_18px_rgba(124,3,211,0.35)] backdrop-blur transition hover:border-[#ddb7ff] hover:bg-[#21182a]"
            >
              <IoChevronForwardOutline className="h-6 w-6" />
            </button>

            <div
              ref={timelineScrollRef}
              className="min-w-0 overflow-x-auto overflow-y-hidden pb-3 pt-1 scroll-smooth [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="relative flex min-w-full w-max items-start justify-center gap-9 px-20">
                <div className="pointer-events-none absolute left-24 right-24 top-[124px] h-2 overflow-hidden rounded-full border border-[#362348] bg-[#130a1c]/80">
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
                      className="group grid w-[125px] shrink-0 justify-items-center pb-4 text-center outline-none"
                    >
                      <span
                        className={clsx(
                          getFrameClassName(level, isSelected),
                          "flex h-[100px] w-[100px] items-center justify-center rounded-xl",
                          isSelected && "ring-2 ring-[#ddb7ff]",
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
                            <IoCheckmarkCircleOutline className="h-4 w-4 text-[#4edea3]" />
                          </span>
                        )}
                        {!level.claimed && level.unlocked && (
                          <span className="absolute right-1 top-1 rounded-full bg-[#130a1c]/85 p-1">
                            <IoGiftOutline className="h-4 w-4 text-[#ddb7ff]" />
                          </span>
                        )}
                        {!level.claimed && !level.unlocked && (
                          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-amber-300/70 bg-[#130a1c]/95 p-1.5 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.35)]">
                            <StatusIcon className="h-4 w-4" />
                          </span>
                        )}
                      </span>
                      <span
                        className={clsx(
                          "mt-9 rounded-md border px-2 py-0.5 text-sm font-black",
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

          <div className="relative space-y-3 pl-5 md:hidden">
            <div className="absolute bottom-4 left-2 top-4 w-1 overflow-hidden rounded-full bg-[#21182a]">
              <div
                className="w-full rounded-full bg-gradient-to-b from-[#4edea3] via-[#7c03d3] to-[#b76dff]"
                style={{ height: `${progressPercent}%` }}
              />
            </div>
            {data.levels.map((level) => {
              const image = getRewardImage(level);
              const StatusIcon = getStatusIcon(level);
              const isSelected = selectedLevel?.id === level.id;

              return (
                <div
                  key={level.id}
                  className={clsx(
                    "grid w-full grid-cols-[minmax(0,1fr)_40px] items-center gap-3 rounded-2xl border bg-[#21182a]/88 p-3 text-left transition",
                    isSelected
                      ? "border-[#ddb7ff] shadow-[0_0_18px_rgba(124,3,211,0.3)]"
                      : "border-[#362348]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setFixedLevelId(level.id)}
                    className="grid min-w-0 grid-cols-[52px_minmax(0,1fr)] items-center gap-3 text-left"
                  >
                    <span
                      className={clsx(
                        getFrameClassName(level, isSelected),
                        "flex h-14 w-14 items-center justify-center rounded-xl",
                      )}
                    >
                      {image ? (
                        <Image
                          src={toAssetStorageUrl(image)}
                          alt={rewardLabel(level)}
                          width={72}
                          height={72}
                          className={clsx(
                            "h-full w-full",
                            level.rewardType === "PV"
                              ? "object-contain p-1"
                              : "rounded-[inherit] object-cover object-center",
                          )}
                        />
                      ) : (
                        <IoGiftOutline className="h-6 w-6 text-[#ddb7ff]" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#988d9f]">
                        Nivel {level.levelNumber}
                      </span>
                      <span className="mt-1 block truncate text-sm font-bold text-white">
                        {rewardLabel(level)}
                      </span>
                      <span
                        className={clsx(
                          "mt-1 block text-xs font-semibold",
                          level.claimed
                            ? "text-[#4edea3]"
                            : level.unlocked
                              ? "text-[#ddb7ff]"
                              : "text-amber-300",
                        )}
                      >
                        {getStatusLabel(level)}
                      </span>
                    </span>
                  </button>

                  {level.unlocked && !level.claimed ? (
                    <button
                      type="button"
                      aria-label={`Reclamar ${rewardLabel(level)}`}
                      onClick={() => handleClaim(level)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ddb7ff]/45 bg-[#7c03d3]/25 text-[#ddb7ff] transition hover:border-[#ddb7ff] hover:bg-[#7c03d3]/40"
                    >
                      <IoGiftOutline className="h-5 w-5" />
                    </button>
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl text-[#ddb7ff]">
                      <StatusIcon
                        className={clsx(
                          "h-6 w-6",
                          level.claimed ? "text-[#4edea3]" : "text-amber-300",
                        )}
                      />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {claimedRewardLevel && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-6 backdrop-blur-sm md:hidden"
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
    </section>
  );
};
