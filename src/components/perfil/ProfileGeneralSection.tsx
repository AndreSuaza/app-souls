"use client";

import Image from "next/image";
import { FiAward, FiTarget, FiTrendingUp } from "react-icons/fi";
import { IoLayersOutline, IoTrophyOutline } from "react-icons/io5";
import { TbPhotoEdit } from "react-icons/tb";
import type { ProfileTab } from "./ProfileSectionsTabs";
import { ProfileAvatarFrame } from "./ProfileAvatarFrame";
import type { ProfileDashboardSection } from "./ProfileDashboardSidebar";
import type { ProfileUser } from "./ProfileSection.types";
import { getAvatarUrl } from "@/utils/avatar-image";
import { getProfileBannerUrl } from "@/utils/profile-banner";
import { getProfileFrameUrl } from "@/utils/profile-frame";
import { PLAYER_PROFILE_FRAMES_ENABLED } from "@/config/features";

type Props = {
  user: ProfileUser;
  fullName: string;
  selectedAvatar: string;
  selectedBanner: string;
  selectedFrame: string;
  matchesPlayed: number;
  winrate: number;
  tournamentsPlayed: number;
  deckCountToShow: number;
  victoryPoints: number;
  onSectionChange: (section: ProfileDashboardSection) => void;
  onTabShortcut: (tab: ProfileTab) => void;
};

export const ProfileGeneralSection = ({
  user,
  fullName,
  selectedAvatar,
  selectedBanner,
  selectedFrame,
  matchesPlayed,
  winrate,
  tournamentsPlayed,
  deckCountToShow,
  victoryPoints,
  onSectionChange,
  onTabShortcut,
}: Props) => {
  return (
    <div className="space-y-8">
      <section className="relative min-h-[320px] overflow-visible rounded-2xl border border-slate-200 bg-white/80 shadow-xl sm:min-h-[360px] lg:min-h-[400px] dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70">
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <Image
            src={getProfileBannerUrl(selectedBanner)}
            alt="Banner de perfil"
            title="Banner de perfil"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-50/95 via-slate-50/60 to-transparent dark:from-tournament-dark-bg/95 dark:via-tournament-dark-bg/60" />
        </div>
        <button
          type="button"
          onClick={() => onSectionChange("banner")}
          aria-label="Cambiar fondo del perfil"
          className="absolute inset-0 z-[1] cursor-pointer"
        />
        <button
          type="button"
          onClick={() => onSectionChange("avatar")}
          title="Personalizar avatar"
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-purple-500/60 bg-purple-600/80 text-white shadow-lg shadow-purple-700/30 transition hover:bg-purple-500 sm:bottom-4 sm:right-4 sm:top-auto"
        >
          <TbPhotoEdit className="h-5 w-5" />
        </button>

        <div className="relative z-10 flex min-h-[320px] flex-row items-end justify-between gap-6 px-6 pb-6 pt-24 sm:min-h-[360px] sm:px-10 sm:pt-28 lg:min-h-[400px] lg:px-14 lg:pt-32">
          <div className="flex flex-row items-end gap-7 sm:gap-8">
            <ProfileAvatarFrame
              avatarSrc={getAvatarUrl(selectedAvatar || user.image)}
              avatarAlt={
                user.nickname ? `Avatar de ${user.nickname}` : "Avatar de usuario"
              }
              avatarTitle={
                user.nickname ? `Avatar de ${user.nickname}` : "Avatar de usuario"
              }
              frameSrc={
                PLAYER_PROFILE_FRAMES_ENABLED && selectedFrame
                  ? getProfileFrameUrl(selectedFrame)
                  : undefined
              }
            />
            <div className="space-y-2 text-left">
              <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl dark:text-white">
                {user.nickname}
              </h1>
              <p className="text-sm text-slate-600 sm:text-base dark:text-purple-200">
                {fullName}
              </p>
              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
                <button
                  type="button"
                  onClick={() => onTabShortcut("history")}
                  title="Ver torneos jugados"
                  className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100/70 px-3 py-1 text-amber-700 transition hover:bg-amber-200/70 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-100 dark:hover:bg-amber-500/25"
                >
                  <IoTrophyOutline className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                  <span className="text-xs font-semibold">
                    {tournamentsPlayed}
                  </span>
                  <span className="sr-only">Torneos jugados</span>
                </button>
                <button
                  type="button"
                  onClick={() => onTabShortcut("decks")}
                  title="Ver mazos"
                  className="inline-flex items-center gap-2 rounded-full border border-purple-300/60 bg-purple-100/70 px-3 py-1 text-purple-700 transition hover:bg-purple-200/70 dark:border-purple-400/40 dark:bg-purple-500/15 dark:text-purple-100 dark:hover:bg-purple-500/25"
                >
                  <IoLayersOutline className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                  <span className="text-xs font-semibold">
                    {deckCountToShow}
                  </span>
                  <span className="sr-only">Mazos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface/80">
          <div className="absolute left-1/2 top-0 h-1 w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-400/90 to-transparent" />
          <div className="flex items-center gap-2">
            <FiTrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-300" />
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-purple-300">
              Win rate
            </p>
          </div>
          <p className="mt-2 text-3xl font-semibold text-amber-600 dark:text-amber-200">
            {winrate}%
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Basado en {matchesPlayed} partidas
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface/80">
          <div className="absolute left-1/2 top-0 h-1 w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-fuchsia-500/90 to-transparent" />
          <div className="flex items-center gap-2">
            <FiAward className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-300" />
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-purple-300">
              Puntos de victoria
            </p>
          </div>
          <p className="mt-2 text-3xl font-semibold text-fuchsia-600 dark:text-fuchsia-200">
            {victoryPoints}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Acumulados
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface/80">
          <div className="absolute left-1/2 top-0 h-1 w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-400/90 to-transparent" />
          <div className="flex items-center gap-2">
            <FiTarget className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-purple-300">
              Elo
            </p>
          </div>
          <p className="mt-2 text-3xl font-semibold text-indigo-600 dark:text-indigo-200">
            {user.eloPoints ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Ranking actual
          </p>
        </div>
      </section>
    </div>
  );
};
