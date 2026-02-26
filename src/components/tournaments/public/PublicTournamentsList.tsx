"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IoCalendarOutline } from "react-icons/io5";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaginationLine } from "@/components/ui";
import { PublicTournamentsFilters } from "./PublicTournamentsFilters";
import { PublicTournamentsTable } from "./PublicTournamentsTable";
import { PublicTournamentsMobileList } from "./PublicTournamentsMobileList";

type TournamentStatus = "pending" | "in_progress" | "finished";

type TournamentItem = {
  id: string;
  title: string;
  date: string;
  status: TournamentStatus;
  storeName?: string | null;
  playersCount?: number;
  tierName?: string | null;
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
  { value: "finished", label: "Finalizados" },
];

export function PublicTournamentsList({ tournaments }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selectedDate, setSelectedDate] = useState("");
  const prevFilterRef = useRef(activeFilter);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const minDate = "2025-12-01";

  const handleDatePickerOpen = () => {
    const input = dateInputRef.current;
    if (!input) return;

    // Abrimos el selector desde el contenedor para que toda el área sea clicable.
    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof pickerInput.showPicker === "function") {
      pickerInput.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  const ordered = useMemo(() => {
    // Mantiene los finalizados al final cuando se muestran todos.
    return [...tournaments].sort((a, b) => {
      const weight = (status: TournamentStatus) => {
        if (status === "in_progress") return 0;
        if (status === "pending") return 1;
        return 2;
      };
      const weightA = weight(a.status);
      const weightB = weight(b.status);
      if (weightA !== weightB) return weightA - weightB;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [tournaments]);

  const filtered = useMemo(() => {
    const byStatus =
      activeFilter === "all"
        ? ordered
        : ordered.filter((tournament) => tournament.status === activeFilter);

    if (!selectedDate) return byStatus;
    return byStatus.filter((tournament) => {
      const tournamentDay = new Date(tournament.date)
        .toISOString()
        .slice(0, 10);
      return tournamentDay === selectedDate;
    });
  }, [activeFilter, ordered, selectedDate]);

  const pageParam = Number(searchParams.get("page") ?? 1);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (prevFilterRef.current === activeFilter) return;
    prevFilterRef.current = activeFilter;

    // Reinicia la pagina cuando cambia el filtro.
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [activeFilter, pathname, router, searchParams]);

  useEffect(() => {
    if (currentPage > totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set("page", totalPages.toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [currentPage, totalPages, pathname, router, searchParams]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <IoCalendarOutline className="h-5 w-5 text-purple-600 dark:text-purple-300" />
          Próximos torneos
        </h2>

        <PublicTournamentsFilters
          filters={filters}
          activeFilter={activeFilter}
          onChange={setActiveFilter}
          leading={
            <div className="relative">
              <input
                ref={dateInputRef}
                id="public-tournaments-date"
                type="date"
                value={selectedDate}
                min={minDate}
                max={todayIso}
                onChange={(event) => setSelectedDate(event.target.value)}
                title="Filtrar por fecha"
                aria-label="Filtrar por fecha"
                className="sr-only"
              />
              <button
                type="button"
                onClick={handleDatePickerOpen}
                aria-label="Seleccionar fecha"
                className="flex h-9 items-center gap-2 rounded-lg bg-slate-100 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-accent dark:hover:text-white"
              >
                {selectedDate && (
                  <span className="text-xs font-semibold">{selectedDate}</span>
                )}
                <IoCalendarOutline className="h-4 w-4" />
              </button>
            </div>
          }
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
        />
      )}
    </section>
  );
}
