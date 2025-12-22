"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PaginationLine } from "@/components/ui";
import { AdminTournamentsSearch } from "./AdminTournamentsSearch";
import {
  AdminTournamentsTable,
  type AdminTournamentStatusConfig,
} from "./AdminTournamentsTable";
import { AdminTournamentsCards } from "./AdminTournamentsCards";

type TournamentStatus = "pending" | "in_progress" | "finished" | "cancelled";

export type AdminTournamentListItem = {
  id: string;
  title: string;
  date: string;
  status: TournamentStatus;
  playersCount: number;
};

type Props = {
  tournaments: AdminTournamentListItem[];
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

export const AdminTournamentsList = ({ tournaments }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  const pageParam = Number(searchParams.get("page") ?? 1);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return tournaments;
    return tournaments.filter((t) => t.title.toLowerCase().includes(term));
  }, [query, tournaments]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage !== 1) {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [query]);

  useEffect(() => {
    if (currentPage > totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set("page", totalPages.toString());
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [currentPage, totalPages, pathname, router, searchParams]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleRowClick = (id: string, status: TournamentStatus) => {
    if (status === "cancelled") return;
    router.push(`/administrador/torneos/${id}`);
  };

  return (
    <div className="space-y-4">
      <AdminTournamentsSearch
        query={query}
        totalCount={filtered.length}
        onChange={setQuery}
      />

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          No hay torneos para mostrar.
        </div>
      ) : (
        <>
          <AdminTournamentsTable
            tournaments={paginated}
            statusConfig={statusConfig}
            formatDate={formatDate}
            onSelect={handleRowClick}
          />

          <AdminTournamentsCards
            tournaments={paginated}
            statusConfig={statusConfig}
            formatDate={formatDate}
            onSelect={handleRowClick}
          />

          <PaginationLine
            totalPages={totalPages}
            currentPage={currentPage}
            pathname={pathname}
            searchParams={searchParams}
          />
        </>
      )}
    </div>
  );
};
