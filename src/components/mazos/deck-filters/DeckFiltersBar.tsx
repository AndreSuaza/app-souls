"use client";

import clsx from "clsx";
import { useMemo } from "react";
import { PaginationStats } from "@/components/ui/pagination/PaginationStats";

interface ArchetypeOption {
  id: string;
  name: string | null;
}

export type DeckFiltersState = {
  tournament: "all" | "with" | "without";
  date: "recent" | "old";
  archetypeId: string;
  likes: "" | "1";
};

interface Props {
  archetypes: ArchetypeOption[];
  filters: DeckFiltersState;
  onChange: (nextFilters: DeckFiltersState) => void;
  isLoading?: boolean;
  statsRangeText?: string;
  statsEntityLabel?: string;
}

const tournamentOptions = [
  { value: "all", label: "Todos" },
  { value: "with", label: "Competitivos" },
] as const;

const dateOptions = [
  { value: "recent", label: "Mas recientes" },
  { value: "old", label: "Mas antiguos" },
] as const;

export function DeckFiltersBar({
  archetypes,
  filters,
  onChange,
  isLoading = false,
  statsRangeText,
  statsEntityLabel = "mazos",
}: Props) {
  const archetypeOptions = useMemo(
    () =>
      archetypes.map((item) => ({
        id: item.id,
        name:
          item.name && item.name.trim().length > 0
            ? item.name
            : "Sin arquetipo",
      })),
    [archetypes],
  );

  const labelClass = "text-xs font-semibold text-slate-500 dark:text-slate-400";
  const selectClass =
    "mt-1 w-full lg:w-auto min-w-0 lg:min-w-[180px] max-w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30";
  const loadingClass = isLoading ? "opacity-70" : "";

  return (
    <section className="py-1">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] lg:flex lg:flex-wrap lg:items-end">
        <div className="flex w-full min-w-0 flex-col lg:w-auto lg:min-w-[180px]">
          <span className={labelClass}>Torneo</span>
          <select
            value={filters.tournament}
            onChange={(event) =>
              onChange({
                ...filters,
                tournament: event.target
                  .value as DeckFiltersState["tournament"],
              })
            }
            className={clsx(
              selectClass,
              loadingClass,
              filters.tournament !== "all" && "border-purple-600",
            )}
            title="Filtrar por torneo"
            disabled={isLoading}
          >
            {tournamentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex w-full min-w-0 flex-col lg:w-auto lg:min-w-[180px]">
          <span className={labelClass}>Fecha</span>
          <select
            value={filters.date}
            onChange={(event) =>
              onChange({
                ...filters,
                date: event.target.value as DeckFiltersState["date"],
              })
            }
            className={clsx(
              selectClass,
              loadingClass,
              filters.date !== "recent" && "border-purple-600",
            )}
            title="Ordenar por fecha"
            disabled={isLoading}
          >
            {dateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex w-full min-w-0 flex-col lg:w-auto lg:min-w-[180px]">
          <span className={labelClass}>Arquetipo</span>
          <select
            value={filters.archetypeId}
            onChange={(event) =>
              onChange({
                ...filters,
                archetypeId: event.target.value,
              })
            }
            className={clsx(
              selectClass,
              loadingClass,
              filters.archetypeId && "border-purple-600",
            )}
            title="Filtrar por arquetipo"
            disabled={isLoading}
          >
            <option value="">Todos</option>
            {archetypeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex w-full min-w-0 flex-col lg:w-auto lg:min-w-[180px]">
          <span className={labelClass}>Relevancia</span>
          <select
            value={filters.likes}
            onChange={(event) =>
              onChange({
                ...filters,
                likes: event.target.value as DeckFiltersState["likes"],
              })
            }
            className={clsx(
              selectClass,
              loadingClass,
              filters.likes === "1" && "border-purple-600",
            )}
            title="Ordenar por relevancia"
            disabled={isLoading}
          >
            <option value="">Normal</option>
            <option value="1">Mas votados</option>
          </select>
        </div>

        {statsRangeText && (
          <PaginationStats
            rangeText={statsRangeText}
            entityLabel={statsEntityLabel}
            className="order-last col-span-2 w-full pb-1 text-left sm:col-span-1 sm:col-start-3 sm:w-auto sm:justify-self-end sm:self-end sm:text-right lg:ml-auto lg:flex-1"
            isLoading={isLoading}
            loadingText="Actualizando mazos..."
          />
        )}
      </div>
    </section>
  );
}
