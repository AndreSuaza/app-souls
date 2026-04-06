"use client";

import Link from "next/link";
import clsx from "clsx";
import { IoAddOutline } from "react-icons/io5";
import { useUserDecksStore } from "@/store";
import { UserDeckLibrary } from "../mazos/deck-library/UserDeckLibrary";
import { ProfileInfoTooltip } from "./ProfileInfoTooltip";

type Props = {
  hasSession: boolean;
};

export const ProfileDecksSection = ({ hasSession }: Props) => {
  // Mantiene el limite alineado con save-deck.action.ts para no ofrecer mas mazos de los permitidos.
  const MAX_USER_DECKS = 12;
  const deckFilters = useUserDecksStore((state) => state.filters);
  const setDeckFilters = useUserDecksStore((state) => state.setFilters);
  const fetchDecks = useUserDecksStore((state) => state.fetchDecks);
  const hasLoadedDecks = useUserDecksStore((state) => state.hasLoaded);
  const nonTournamentCount = useUserDecksStore(
    (state) => state.nonTournamentCount,
  );

  return (
    <section className="w-full">
      <h2 className="mb-4 text-2xl font-semibold text-purple-200">Mis mazos</h2>
      <UserDeckLibrary
        archetypes={[]}
        hasSession={hasSession}
        disableLikeButton={false}
        headerContent={
          <div className="flex flex-wrap items-center gap-3">
            {hasSession && hasLoadedDecks ? (
              <div className="flex items-center gap-2">
                {(() => {
                  const tooltipText =
                    "La cantidad maxima de mazos permitidos es 12.";
                  const hasReachedMax = nonTournamentCount >= MAX_USER_DECKS;
                  if (hasReachedMax) {
                    return (
                      <>
                        <button
                          type="button"
                          disabled
                          className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-600 px-1 text-xs font-semibold leading-none text-white shadow-sm opacity-60 sm:gap-2 sm:px-3 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200"
                        >
                          <IoAddOutline className="h-4 w-4" />
                          Crear mazo
                        </button>
                        <ProfileInfoTooltip text={tooltipText} />
                      </>
                    );
                  }
                  return (
                    <>
                      <Link
                        href="/laboratorio"
                        title="Crear un mazo en el laboratorio"
                        className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-600 px-1 text-xs font-semibold leading-none text-white shadow-sm transition hover:bg-emerald-500 sm:gap-2 sm:px-3 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200"
                      >
                        <IoAddOutline className="h-4 w-4" />
                        Crear mazo
                      </Link>
                      <ProfileInfoTooltip text={tooltipText} />
                    </>
                  );
                })()}
              </div>
            ) : null}
            <div className="ml-auto flex flex-wrap gap-2">
              {(
                [
                  { value: "without", label: "Mazos" },
                  { value: "with", label: "Competitivos" },
                ] as const
              ).map((filter) => {
                const isActive = deckFilters.tournament === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => {
                      const nextFilters = {
                        ...deckFilters,
                        tournament: filter.value,
                      };
                      setDeckFilters(nextFilters);
                      fetchDecks({
                        tournament: nextFilters.tournament,
                        archetypeId: nextFilters.archetypeId,
                        date: nextFilters.date,
                        likes: nextFilters.likes === "1",
                        page: 1,
                      });
                    }}
                    className={clsx(
                      "inline-flex items-center rounded-lg border px-5 py-2 text-xs font-semibold uppercase tracking-wide transition",
                      isActive
                        ? "border-purple-600 bg-purple-600 text-white shadow-sm"
                        : "border-transparent bg-white text-slate-500 hover:text-purple-600 dark:bg-tournament-dark-muted dark:text-slate-300",
                    )}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        }
      />
    </section>
  );
};
