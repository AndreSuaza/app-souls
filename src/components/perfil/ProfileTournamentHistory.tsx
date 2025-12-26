"use client";

import { useEffect, useMemo } from "react";
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

export const ProfileTournamentHistory = ({ tournaments }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Normaliza el page param para evitar indices invalidos.
  const pageParam = Number(searchParams.get("page") ?? 1);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const totalPages = Math.max(1, Math.ceil(tournaments.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set("page", totalPages.toString());
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [currentPage, totalPages, pathname, router, searchParams]);

  // Aplica paginacion local sin reconsultar datos.
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return tournaments.slice(start, start + PAGE_SIZE);
  }, [tournaments, currentPage]);

  const handleRowClick = (id: string, status: AdminTournamentRow["status"]) => {
    if (status === "cancelled") return;
    router.push("/torneos");
  };

  if (tournaments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        No hay torneos para mostrar.
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
    dateBadge:
      "bg-gray-800/60 text-gray-200 ring-1 ring-inset ring-white/5",
  };

  // Versión mobile con el mismo tema oscuro.
  const cardClasses: AdminTournamentsCardsClassNames = {
    card: "bg-gray-800/60 border-gray-700/50 text-gray-200",
    title: "text-gray-200",
    metaRow: "text-gray-400",
    dateBadge:
      "bg-gray-800/60 text-gray-200 ring-1 ring-inset ring-white/5",
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

      <PaginationLine
        totalPages={totalPages}
        currentPage={currentPage}
        pathname={pathname}
        searchParams={searchParams}
        className="text-gray-200"
      />
    </div>
  );
};
