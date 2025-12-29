"use client";

import { useEffect, useMemo, useState, type MouseEventHandler } from "react";
import clsx from "clsx";
import { usePathname, useSearchParams } from "next/navigation";
import { PaginationLine } from "@/components/ui";
import { RoundInterface, TournamentPlayerInterface } from "@/interfaces";
import { sortPlayersByRanking } from "@/utils/ranking";
import {
  RankingDesktopTable,
  type RankingDesktopTableClassNames,
} from "../tournaments/tournament/players/RankingDesktopTable";
import {
  RankingMobileList,
  type RankingMobileListClassNames,
} from "../tournaments/tournament/players/RankingMobileList";

type TournamentStatus = "pending" | "in_progress" | "finished" | "cancelled";

export type TournamentRankingPanelClassNames = {
  container?: string;
  title?: string;
  pagination?: string;
  emptyState?: string;
};

type Props = {
  players: TournamentPlayerInterface[];
  rounds: RoundInterface[];
  status?: TournamentStatus;
  showPodium?: boolean;
  title?: string;
  showTitle?: boolean;
  pageSize?: number;
  classNames?: TournamentRankingPanelClassNames;
  desktopClassNames?: RankingDesktopTableClassNames;
  mobileClassNames?: RankingMobileListClassNames;
};

const DEFAULT_PAGE_SIZE = 8;

export const TournamentRankingPanel = ({
  players,
  rounds,
  status,
  showPodium,
  title = "Clasificacion general",
  showTitle = true,
  pageSize = DEFAULT_PAGE_SIZE,
  classNames,
  desktopClassNames,
  mobileClassNames,
}: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const shouldShowPodium =
    showPodium !== undefined ? showPodium : status === "finished";

  // Ordena los jugadores sin mutar el arreglo original.
  const sortedPlayers = useMemo(() => sortPlayersByRanking(players), [players]);

  const totalPages = Math.max(1, Math.ceil(sortedPlayers.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Aplica paginacion local para no recargar la ruta.
  const paginatedPlayers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedPlayers.slice(start, start + pageSize);
  }, [sortedPlayers, currentPage, pageSize]);

  const handlePaginationClick: MouseEventHandler<HTMLDivElement> = (event) => {
    const target = event.target as HTMLElement;
    const link = target.closest("a");
    if (!link) return;

    event.preventDefault();
    const url = new URL(link.href);
    const pageParam = Number(url.searchParams.get("page") ?? 1);
    if (isNaN(pageParam) || pageParam < 1 || pageParam > totalPages) {
      return;
    }

    setCurrentPage(pageParam);
  };

  if (sortedPlayers.length === 0) {
    return (
      <div
        className={clsx(
          "border rounded-md p-6 flex items-center justify-center w-full",
          classNames?.emptyState ?? "bg-white text-gray-400"
        )}
      >
        No hay jugadores aun
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "border rounded-md px-4 py-3 w-full",
        classNames?.container ?? "bg-white"
      )}
    >
      {showTitle && title && (
        <h2
          className={clsx(
            "text-lg font-bold mb-4 text-left",
            classNames?.title
          )}
        >
          {title}
        </h2>
      )}

      <RankingDesktopTable
        players={paginatedPlayers}
        rounds={rounds}
        currentPage={currentPage}
        pageSize={pageSize}
        showPodium={shouldShowPodium}
        classNames={desktopClassNames}
      />

      <RankingMobileList
        players={paginatedPlayers}
        rounds={rounds}
        currentPage={currentPage}
        pageSize={pageSize}
        showPodium={shouldShowPodium}
        classNames={mobileClassNames}
      />

      {totalPages > 1 && (
        <div onClick={handlePaginationClick}>
          <PaginationLine
            totalPages={totalPages}
            currentPage={currentPage}
            pathname={pathname}
            searchParams={searchParams}
            className={classNames?.pagination}
          />
        </div>
      )}
    </div>
  );
};
