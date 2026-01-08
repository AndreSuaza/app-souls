"use client";

import { IoSearchOutline } from "react-icons/io5";

type Props = {
  query: string;
  totalCount: number;
  onChange: (value: string) => void;
};

export const AdminTournamentsSearch = ({
  query,
  totalCount,
  onChange,
}: Props) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          value={query}
          type="search"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Buscar por nombre"
          className="w-full rounded-lg border border-tournament-dark-accent dark:border-tournament-dark-border bg-white dark:bg-tournament-dark-surface py-2 pl-10 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {totalCount} torneo{totalCount === 1 ? "" : "s"}
      </p>
    </div>
  );
};
