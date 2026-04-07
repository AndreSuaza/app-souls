"use client";

import Image from "next/image";
import { FiTrendingUp } from "react-icons/fi";
import {
  IoGameControllerOutline,
  IoLayersOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import { ProfileSectionsStack } from "./ProfileSectionsStack";
import { ProfileTournamentHistorySection } from "./ProfileTournamentHistorySection";
import { ProfilePublicDecksSection } from "./ProfilePublicDecksSection";
import { getAvatarUrl } from "@/utils/avatar-image";
import { getProfileBannerUrl } from "@/utils/profile-banner";
import type { Deck, DeckPagination } from "@/interfaces";

type TournamentStatus = "pending" | "in_progress" | "finished" | "cancelled";

type TournamentHistoryItem = {
  id: string;
  title: string;
  date: string;
  status: TournamentStatus;
  playersCount: number;
};

type PublicUser = {
  id: string;
  nickname?: string | null;
  name?: string | null;
  lastname?: string | null;
  image?: string | null;
  bannerImage?: string | null;
  matchesPlayed?: number | null;
  eloPoints?: number | null;
  tournamentsPlayed?: number | null;
};

type DeckLibraryData = {
  decks: Deck[];
  pagination: DeckPagination;
  likedDeckIds: string[];
};

type Props = {
  user: PublicUser;
  tournaments: TournamentHistoryItem[];
  publicDecksCount: number;
  deckLibrary: DeckLibraryData;
  hasSession: boolean;
};

export const ProfilePublicView = ({
  user,
  tournaments,
  publicDecksCount,
  deckLibrary,
  hasSession,
}: Props) => {
  const matchesPlayed = user.matchesPlayed ?? 0;
  const eloPoints = user.eloPoints ?? 0;
  const winrateRaw = matchesPlayed > 0 ? (eloPoints / matchesPlayed) * 100 : 0;
  const winrate = Math.min(100, Math.max(0, Math.round(winrateRaw)));
  const tournamentsPlayed = tournaments.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-tournament-dark-bg dark:text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-10 pt-6">
        <section className="relative min-h-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-xl sm:min-h-[360px] lg:min-h-[400px] dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70">
          <div className="absolute inset-0">
            <Image
              src={getProfileBannerUrl(user.bannerImage)}
              alt="Banner de perfil"
              title="Banner de perfil"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-50/95 via-slate-50/60 to-transparent dark:from-tournament-dark-bg/95 dark:via-tournament-dark-bg/60" />
          </div>

          <div className="relative z-10 flex min-h-[320px] flex-row items-end justify-between gap-6 px-3 pb-6 pt-24 sm:min-h-[360px] sm:pt-28 lg:min-h-[400px] lg:pt-32">
            <div className="flex flex-row items-end gap-4">
              <div className="relative">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-purple-500 shadow-[0_0_25px_rgba(147,51,234,0.45)] sm:h-36 sm:w-36">
                  <Image
                    src={getAvatarUrl(user.image)}
                    alt={
                      user.nickname
                        ? `Avatar de ${user.nickname}`
                        : "Avatar de usuario"
                    }
                    title={
                      user.nickname
                        ? `Avatar de ${user.nickname}`
                        : "Avatar de usuario"
                    }
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-2 text-left">
                <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl dark:text-white">
                  {user.nickname}
                </h1>
                <p className="text-sm text-slate-600 sm:text-base dark:text-purple-200">
                  {[user.name, user.lastname].filter(Boolean).join(" ")}
                </p>
                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  <a
                    href="#public-tournaments"
                    title="Ver torneos jugados"
                    className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100/70 px-3 py-1 text-amber-700 transition hover:bg-amber-200/70 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-100 dark:hover:bg-amber-500/25"
                  >
                    <IoTrophyOutline className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                    <span className="text-xs font-semibold">
                      {tournamentsPlayed}
                    </span>
                    <span className="sr-only">Torneos jugados</span>
                  </a>
                  <a
                    href="#public-decks"
                    title="Ver mazos publicos"
                    className="inline-flex items-center gap-2 rounded-full border border-purple-300/60 bg-purple-100/70 px-3 py-1 text-purple-700 transition hover:bg-purple-200/70 dark:border-purple-400/40 dark:bg-purple-500/15 dark:text-purple-100 dark:hover:bg-purple-500/25"
                  >
                    <IoLayersOutline className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                    <span className="text-xs font-semibold">
                      {publicDecksCount}
                    </span>
                    <span className="sr-only">Mazos publicos</span>
                  </a>
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
              <IoGameControllerOutline className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-300" />
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-purple-300">
                Partidas jugadas
              </p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-fuchsia-600 dark:text-fuchsia-200">
              {matchesPlayed}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Total registradas
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface/80">
            <div className="absolute left-1/2 top-0 h-1 w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-400/90 to-transparent" />
            <div className="flex items-center gap-2">
              <IoTrophyOutline className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-purple-300">
                Elo
              </p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-indigo-600 dark:text-indigo-200">
              {eloPoints}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Ranking actual
            </p>
          </div>
        </section>

        <ProfileSectionsStack
          sections={[
            {
              id: "public-tournaments",
              content: (
                <div id="public-tournaments">
                  <ProfileTournamentHistorySection tournaments={tournaments} />
                </div>
              ),
            },
            {
              id: "public-decks",
              content: (
                <ProfilePublicDecksSection
                  userId={user.id}
                  initialDecks={deckLibrary.decks}
                  initialPagination={deckLibrary.pagination}
                  initialLikedDeckIds={deckLibrary.likedDeckIds}
                  hasSession={hasSession}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};
