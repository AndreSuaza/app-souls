"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import clsx from "clsx";
import { IoCloseOutline, IoGiftOutline } from "react-icons/io5";
import type {
  PlayerBattlePassLevel,
  SyncedBattlePassReward,
} from "@/actions/battle-pass/player-battle-pass.action";
import { toAssetStorageUrl } from "@/utils/asset-path";

const BATTLE_PASS_PV_IMAGE = "/battle-pass/victory-points.png";

const rewardTypeLabels: Record<PlayerBattlePassLevel["rewardType"], string> = {
  AVATAR: "Avatar",
  BANNER: "Banner",
  PV: "PV",
  MANUAL: "Entrega en tienda",
};

const rewardLabel = (reward: SyncedBattlePassReward) => {
  if (reward.rewardType === "PV") {
    return `${reward.victoryPointsReward ?? 0} PV`;
  }

  if (reward.rewardType === "MANUAL") {
    return reward.manualRewardLabel ?? "Entrega en tienda";
  }

  return reward.rewardAvatar?.name ?? reward.title;
};

const getRewardImage = (reward: SyncedBattlePassReward) => {
  if (reward.rewardType === "PV") return BATTLE_PASS_PV_IMAGE;
  return reward.imageUrl || reward.rewardAvatar?.imageUrl || "";
};

type Props = {
  rewards: SyncedBattlePassReward[];
  eyebrow?: string;
  title?: string;
  description?: string;
  onClose: () => void;
};

export const BattlePassSyncedRewardsOverlay = ({
  rewards,
  eyebrow = "Recompensas entregadas",
  title = "Pase finalizado",
  description = "Se entregaron automaticamente las recompensas pendientes que habias desbloqueado.",
  onClose,
}: Props) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
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
      container.scrollLeft = Math.max(
        0,
        Math.min(maxScrollLeft, container.scrollLeft + delta),
      );
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [rewards.length]);

  if (rewards.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-[#ddb7ff]/50 bg-[#180f21]/95 p-5 text-center shadow-[0_0_55px_rgba(124,3,211,0.58)] sm:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar recompensas entregadas"
          className="absolute right-4 top-4 rounded-full p-2 text-[#cfc2d6] transition hover:bg-white/10 hover:text-white"
        >
          <IoCloseOutline className="h-5 w-5" />
        </button>

        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#4edea3]">
          {eyebrow}
        </p>
        <h3 className="mt-2 font-['Bebas_Neue'] text-4xl leading-none text-white sm:text-5xl">
          {title}
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[#cfc2d6]">
          {description}
        </p>

        <div
          ref={scrollRef}
          className="mt-6 flex gap-4 overflow-x-auto overflow-y-hidden pb-2 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {rewards.map((reward) => {
            const image = getRewardImage(reward);

            return (
              <article
                key={reward.id}
                className="grid w-40 shrink-0 justify-items-center rounded-2xl border border-[#362348] bg-[#130a1c]/85 p-3 text-center shadow-lg shadow-purple-950/25"
              >
                <div
                  className={clsx(
                    "relative flex h-24 w-24 items-center justify-center overflow-hidden bg-[#21182a]",
                    reward.rewardType === "AVATAR"
                      ? "rounded-full border border-[#ddb7ff]/60"
                      : reward.rewardType === "BANNER"
                        ? "w-full rounded-xl border border-cyan-200/60"
                        : "rounded-xl",
                  )}
                >
                  {image ? (
                    <Image
                      src={toAssetStorageUrl(image)}
                      alt={rewardLabel(reward)}
                      fill
                      sizes="160px"
                      className={clsx(
                        reward.rewardType === "PV"
                          ? "object-contain p-2"
                          : "object-cover object-center",
                      )}
                    />
                  ) : (
                    <IoGiftOutline className="h-10 w-10 text-[#ddb7ff]" />
                  )}
                </div>
                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#988d9f]">
                  Nivel {reward.levelNumber}
                </p>
                <h4 className="mt-1 line-clamp-2 min-h-10 text-sm font-black leading-5 text-white">
                  {rewardLabel(reward)}
                </h4>
                <span className="mt-2 rounded-md bg-[#7c03d3]/25 px-2 py-1 text-[10px] font-black uppercase text-[#ddb7ff]">
                  {rewardTypeLabels[reward.rewardType]}
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};
