"use client";

import type { ReactNode } from "react";
import clsx from "clsx";

type FilterKey = "all" | "in_progress" | "pending" | "finished";

type FilterOption = {
  value: FilterKey;
  label: string;
};

type Props = {
  filters: FilterOption[];
  activeFilter: FilterKey;
  onChange: (value: FilterKey) => void;
  leading?: ReactNode;
};

export function PublicTournamentsFilters({
  filters,
  activeFilter,
  onChange,
  leading,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {leading}
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={clsx(
              "flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors",
              isActive
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-accent dark:hover:text-white"
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
