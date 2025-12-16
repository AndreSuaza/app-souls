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
  const { players } = useTournamentStore();
  const searchParams = useSearchParams();

  const pageParam = Number(searchParams.get("page") ?? 1);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  // Ordena los jugadores
  const sortedPlayers = useMemo<TournamentPlayerInterface[]>(() => {
    return sortPlayersByRanking(players);
  }, [players]);

  const totalPages = Math.max(1, Math.ceil(sortedPlayers.length / PAGE_SIZE));

  // Aplica paginación al ranking ordenado
  const paginatedPlayers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedPlayers.slice(start, start + PAGE_SIZE);
  }, [sortedPlayers, currentPage]);

  if (players.length === 0) {
    return (
      <div className="bg-white border rounded-md p-6 flex items-center justify-center text-gray-400 w-full">
        No hay jugadores aún
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-md p-4 w-full">
      <h2 className="text-lg font-bold mb-4 text-left">
        Clasificación General
      </h2>

      <RankingDesktopTable
        players={paginatedPlayers}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
      />

      <RankingMobileList
        players={paginatedPlayers}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
      />

      <PaginationLine
        totalPages={totalPages}
        currentPage={currentPage}
        pathname={usePathname()}
        searchParams={searchParams}
      />
    </div>
  );
};
