"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaginationLine } from "@/components/ui";
import { PublicTournamentsFilters } from "./PublicTournamentsFilters";
import { PublicTournamentsTable } from "./PublicTournamentsTable";
import { PublicTournamentsMobileList } from "./PublicTournamentsMobileList";

type TournamentStatus = "pending" | "in_progress";

type TournamentItem = {
  id: string;
  title: string;
  date: string;
  status: TournamentStatus;
  storeName?: string | null;
  playersCount?: number;
};

type FilterKey = "all" | TournamentStatus;

type Props = {
  tournaments: TournamentItem[];
};

const PAGE_SIZE = 10;

const statusConfig = {
  in_progress: {
    label: "En progreso",
    className:
      "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-500/30",
  },
  pending: {
    label: "Programado",
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-500/30",
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

const filters: Array<{ value: FilterKey; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "in_progress", label: "En progreso" },
  { value: "pending", label: "Programados" },
];

export function PublicTournamentsList({ tournaments }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const prevFilterRef = useRef(activeFilter);

  const ordered = useMemo(() => {
    // Mantiene el orden con torneos en progreso primero.
    return [...tournaments].sort((a, b) => {
      const weightA = a.status === "in_progress" ? 0 : 1;
      const weightB = b.status === "in_progress" ? 0 : 1;
      if (weightA !== weightB) return weightA - weightB;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [tournaments]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return ordered;
    return ordered.filter((tournament) => tournament.status === activeFilter);
  }, [activeFilter, ordered]);

  const pageParam = Number(searchParams.get("page") ?? 1);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (prevFilterRef.current === activeFilter) return;
    prevFilterRef.current = activeFilter;

    // Reinicia la pagina cuando cambia el filtro.
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  }, [activeFilter, pathname, router, searchParams]);

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

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Próximos torneos
        </h2>

        <PublicTournamentsFilters
          filters={filters}
          activeFilter={activeFilter}
          onChange={setActiveFilter}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-tournament-dark-accent bg-white p-6 text-center text-sm text-slate-500 dark:border-tournament-dark-accent dark:bg-tournament-dark-surface dark:text-slate-300">
          No hay torneos disponibles por ahora.
        </div>
      ) : (
        <>
          <PublicTournamentsTable
            tournaments={paginated}
            statusConfig={statusConfig}
          />
          <PublicTournamentsMobileList
            tournaments={paginated}
            statusConfig={statusConfig}
          />
        </>
      )}

      {totalPages > 1 && (
        <PaginationLine
          totalPages={totalPages}
          currentPage={currentPage}
          pathname={pathname}
          searchParams={searchParams}
          className="text-slate-900 dark:[&_a]:text-slate-200 dark:hover:[&_a]:text-slate-900  dark:[&_a]:hover:text-white"
        />
      )}
    </section>
  );
}
