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
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          type="search"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Buscar por nombre"
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>
      <p className="text-xs text-gray-500">
        {totalCount} torneo{totalCount === 1 ? "" : "s"}
      </p>
    </div>
  );
};
