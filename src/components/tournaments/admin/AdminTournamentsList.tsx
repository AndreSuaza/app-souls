"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const prevQueryRef = useRef(query);

  const pageParam = Number(searchParams.get("page") ?? 1);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return tournaments;
    return tournaments.filter((t) => t.title.toLowerCase().includes(term));
  }, [query, tournaments]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    // Evita filtrar y resetear paginacion en cada tecla.
    const timeoutId = setTimeout(() => {
      setQuery(inputValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  useEffect(() => {
    if (prevQueryRef.current === query) return;
    prevQueryRef.current = query;

    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  }, [query, pathname, router, searchParams]);

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
    router.push(`/admin/torneos/${id}`);
  };

  return (
    <div className="space-y-6">
      <AdminTournamentsSearch
        query={inputValue}
        totalCount={filtered.length}
        onChange={setInputValue}
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-tournament-dark-accent dark:bg-tournament-dark-surface dark:text-slate-300">
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
            className="text-slate-900 dark:text-slate-200 dark:[&_a]:text-slate-200 dark:[&_a]:hover:bg-tournament-dark-border dark:[&_a]:hover:text-white"
          />
        </>
      )}
    </div>
  );
};
