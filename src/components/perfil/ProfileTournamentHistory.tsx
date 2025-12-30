"use client";

import { useEffect, useMemo, useState, type MouseEventHandler } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaginationLine } from "@/components/ui";
import {
  AdminTournamentsTable,
  type AdminTournamentRow,
  type AdminTournamentStatusConfig,
  type AdminTournamentsTableClassNames,
} from "@/components/tournaments/admin/AdminTournamentsTable";
import {
  AdminTournamentsCards,
  type AdminTournamentsCardsClassNames,
} from "@/components/tournaments/admin/AdminTournamentsCards";

type Props = {
  tournaments: AdminTournamentRow[];
  onSelectTournament?: (id: string) => void;
};

const PAGE_SIZE = 10;

const statusConfig: AdminTournamentStatusConfig = {
  pending: {
    label: "Pendiente",
    className: "bg-yellow-100 text-yellow-700",
  },
  in_progress: {
    label: "En progreso",
    className: "bg-blue-100 text-blue-700",
  },
  finished: {
    label: "Finalizado",
    className: "bg-green-100 text-green-700",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-gray-200 text-gray-600",
  },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

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
    const statusOrder: Record<AdminTournamentRow["status"], number> = {
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

  const handleRowClick = (id: string, status: AdminTournamentRow["status"]) => {
    if (status === "cancelled") return;
    if (onSelectTournament) {
      onSelectTournament(id);
      return;
    }
    router.push("/torneos");
  };

  if (tournaments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-700/50 bg-gray-800/60 text-gray-200 p-6 text-center text-sm">
        No tienes torneos registrados.
      </div>
    );
  }

  // Clases para mantener el esquema oscuro sin tocar los componentes base.
  const tableClasses: AdminTournamentsTableClassNames = {
    container: "bg-gray-800/60 border-gray-700/50 text-gray-200",
    table: "text-gray-200",
    head: "bg-gray-800/60 text-gray-400",
    headCell: "text-gray-400",
    body: "divide-y divide-gray-700/50",
    row: "hover:bg-gray-800/70",
    cell: "text-gray-300",
    titleCell: "text-gray-200",
    statusCell: "text-gray-200",
    statusBadge: "ring-1 ring-inset ring-white/5",
    dateBadge: "bg-gray-800/60 text-gray-200 ring-1 ring-inset ring-white/5",
  };

  // Versión mobile con el mismo tema oscuro.
  const cardClasses: AdminTournamentsCardsClassNames = {
    card: "bg-gray-800/60 border-gray-700/50 text-gray-200",
    title: "text-gray-200",
    metaRow: "text-gray-400",
    dateBadge: "bg-gray-800/60 text-gray-200 ring-1 ring-inset ring-white/5",
    playersText: "text-gray-300",
  };

  return (
    <div className="space-y-4">
      <AdminTournamentsTable
        tournaments={paginated}
        statusConfig={statusConfig}
        formatDate={formatDate}
        onSelect={handleRowClick}
        classNames={tableClasses}
      />

      <AdminTournamentsCards
        tournaments={paginated}
        statusConfig={statusConfig}
        formatDate={formatDate}
        onSelect={handleRowClick}
        classNames={cardClasses}
      />

      <div onClick={handlePaginationClick}>
        <PaginationLine
          totalPages={totalPages}
          currentPage={currentPage}
          pathname={pathname}
          searchParams={searchParams}
          className="text-gray-200"
        />
      </div>
    </div>
  );
};
