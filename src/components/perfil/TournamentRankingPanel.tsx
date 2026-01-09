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
          "border rounded-xl p-6 flex items-center justify-center w-full",
          classNames?.emptyState ??
            "border border-dashed border-tournament-dark-accent bg-white text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300"
        )}
      >
        No hay jugadores aún
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "border rounded-xl px-4 py-3 w-full",
        classNames?.container ??
          "bg-white border-tournament-dark-accent text-slate-900 dark:bg-tournament-dark-surface dark:border-tournament-dark-border dark:text-slate-200"
      )}
    >
      {showTitle && title && (
        <h2
          className={clsx(
            "text-lg font-bold mb-4 text-left text-slate-900 dark:text-white",
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
            className={
              classNames?.pagination ??
              "text-slate-900 dark:[&_a]:text-slate-200 dark:hover:[&_a]:text-slate-900  dark:[&_a]:hover:text-white"
            }
          />
        </div>
      )}
    </div>
  );
};
