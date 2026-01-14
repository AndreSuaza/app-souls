"use client";

import { type MouseEventHandler, type ReactNode } from "react";

export interface FilterOptionProps {
  label: string;
  active?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
}

export function FilterOption({
  label,
  active = false,
  onClick,
}: FilterOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-sm font-medium transition rounded-full px-3 py-1 border flex items-center gap-1 min-w-[90px] justify-center whitespace-nowrap ${
        active
          ? "bg-purple-600 text-white border-transparent shadow-lg shadow-purple-600/40"
          : "bg-white text-slate-700 dark:bg-tournament-dark-muted dark:text-slate-200 border-slate-300 dark:border-tournament-dark-border hover:border-purple-400"
      }`}
    >
      {label}
    </button>
  );
}
