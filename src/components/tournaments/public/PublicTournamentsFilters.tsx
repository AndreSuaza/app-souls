"use client";

import clsx from "clsx";

type FilterKey = "all" | "in_progress" | "pending";

type FilterOption = {
  value: FilterKey;
  label: string;
};

type Props = {
  filters: FilterOption[];
  activeFilter: FilterKey;
  onChange: (value: FilterKey) => void;
};

export function PublicTournamentsFilters({
  filters,
  activeFilter,
  onChange,
}: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={clsx(
              "flex h-9 shrink-0 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors",
              isActive
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#362348] dark:text-slate-300 dark:hover:bg-[#4d3267] dark:hover:text-white"
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
