"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTournamentStore } from "@/store";
import { TournamentPlayerInterface } from "@/interfaces";
import { PaginationLine } from "@/components/ui";
import { RankingDesktopTable } from "./RankingDesktopTable";
import { RankingMobileList } from "./RankingMobileList";
import { sortPlayersByRanking } from "@/utils/ranking";

const PAGE_SIZE = 8;

export const TournamentRanking = () => {
  const players = useTournamentStore((state) => state.players);
  const tournament = useTournamentStore((state) => state.tournament);
  const rounds = useTournamentStore((state) => state.rounds);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isFinished = tournament?.status === "finished";

  const pageParam = Number(searchParams.get("page") ?? 1);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  // Ordena los jugadores
  const sortedPlayers = useMemo<TournamentPlayerInterface[]>(() => {
    return sortPlayersByRanking(players);
  }, [players]);

  const totalPages = Math.max(1, Math.ceil(sortedPlayers.length / PAGE_SIZE));

  // Aplica paginacion al ranking ordenado
  const paginatedPlayers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedPlayers.slice(start, start + PAGE_SIZE);
  }, [sortedPlayers, currentPage]);

  if (players.length === 0) {
    return (
      <div className="flex w-full items-center justify-center rounded-xl border border-dashed border-tournament-dark-accent bg-white p-6 text-slate-500 dark:border-tournament-dark-accent dark:bg-tournament-dark-surface dark:text-slate-300">
        No hay jugadores aún
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-tournament-dark-accent bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
      <h2 className="mb-4 text-left text-lg font-bold text-slate-900 dark:text-white">
        Clasificación general
      </h2>

      <RankingDesktopTable
        players={paginatedPlayers}
        rounds={rounds}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        showPodium={isFinished}
        classNames={{
          headerRow:
            "text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-tournament-dark-accent dark:border-tournament-dark-border",
          row: "border-b border-tournament-dark-accent dark:border-tournament-dark-border last:border-none",
          cell: "text-slate-700 dark:text-slate-200",
        }}
      />

      <RankingMobileList
        players={paginatedPlayers}
        rounds={rounds}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        showPodium={isFinished}
        classNames={{
          card: "rounded-xl border border-tournament-dark-accent bg-white p-3 dark:border-tournament-dark-border dark:bg-tournament-dark-surface",
          meta: "text-right text-sm text-slate-700 dark:text-slate-200",
          metaSecondary: "text-slate-500 dark:text-slate-400",
        }}
      />

      <PaginationLine
        totalPages={totalPages}
        currentPage={currentPage}
        pathname={pathname}
        searchParams={searchParams}
      />
    </div>
  );
};
