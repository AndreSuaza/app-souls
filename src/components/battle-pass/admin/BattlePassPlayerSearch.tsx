"use client";

import { useEffect, useRef, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";

export const BattlePassPlayerSearch = ({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) => {
  const [input, setInput] = useState("");
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    const timeout = window.setTimeout(() => onSearchRef.current(input.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [input]);

  return (
    <div className="relative w-full sm:max-w-sm">
      <IoSearchOutline className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
      <input
        type="search"
        aria-label="Buscar jugador"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        maxLength={100}
        placeholder="Nickname, nombre o email"
        className="w-full rounded-lg border border-tournament-dark-accent bg-white py-2 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500"
      />
    </div>
  );
};
