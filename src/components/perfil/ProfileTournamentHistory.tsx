"use client";

import { useEffect, useMemo, useState, type MouseEventHandler } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaginationLine } from "@/components/ui";
import {
  PublicTournamentsMobileList,
  PublicTournamentsTable,
} from "@/components";

type TournamentStatus = "pending" | "in_progress" | "finished" | "cancelled";

type TournamentItem = {
  id: string;
  title: string;
  date: string;
  status: TournamentStatus;
  playersCount: number;
  storeName?: string | null;
};

type Props = {
  tournaments: TournamentItem[];
  onSelectTournament?: (id: string) => void;
};

const PAGE_SIZE = 10;

const statusConfig = {
  pending: {
    label: "Pendiente",
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-500/30",
  },
  in_progress: {
    label: "En progreso",
    className:
      "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-500/30",
  },
  finished: {
    label: "Finalizado",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-500/30",
  },
  cancelled: {
    label: "Cancelado",
    className:
      "bg-slate-200 text-slate-600 ring-slate-300 dark:bg-tournament-dark-muted dark:text-slate-400 dark:ring-tournament-dark-accent",
  },
};

export const ProfileTournamentHistory = ({
  tournaments,
  onSelectTournament,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(tournaments.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Ordena por estado para priorizar en progreso, luego pendientes y al final finalizados.
  const orderedTournaments = useMemo(() => {
    const statusOrder: Record<TournamentStatus, number> = {
      in_progress: 0,
      pending: 1,
      finished: 2,
      cancelled: 3,
    };
    return [...tournaments].sort(
      (a, b) => statusOrder[a.status] - statusOrder[b.status]
    );
  }, [tournaments]);

  // Aplica paginacion local sin reconsultar datos.
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return orderedTournaments.slice(start, start + PAGE_SIZE);
  }, [orderedTournaments, currentPage]);

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

  const handleRowClick = (id: string, status: TournamentStatus) => {
    if (status === "cancelled") return;
    if (onSelectTournament) {
      onSelectTournament(id);
      return;
    }
    router.push("/torneos");
  };

  if (tournaments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-tournament-dark-accent bg-white text-slate-600 p-6 text-center text-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
        No tienes torneos registrados.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PublicTournamentsTable
        tournaments={paginated}
        statusConfig={statusConfig}
        showPlayersColumn
        showActionColumn={false}
        onSelect={(tournament) =>
          handleRowClick(tournament.id, tournament.status)
        }
      />

      <PublicTournamentsMobileList
        tournaments={paginated}
        statusConfig={statusConfig}
        showPlayersColumn
        onSelect={(tournament) =>
          handleRowClick(tournament.id, tournament.status)
        }
      />

      <div onClick={handlePaginationClick}>
        <PaginationLine
          totalPages={totalPages}
          currentPage={currentPage}
          pathname={pathname}
          searchParams={searchParams}
          className="text-slate-900 dark:[&_a]:text-slate-200 dark:hover:[&_a]:text-slate-900  dark:[&_a]:hover:text-white"
        />
      </div>
    </div>
  );
};
