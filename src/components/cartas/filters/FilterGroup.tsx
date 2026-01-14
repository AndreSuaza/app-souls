"use client";

import { type ReactNode } from "react";
import { HiChevronDown } from "react-icons/hi2";

export interface FilterGroupProps {
  label: string;
  icon: ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
  children: ReactNode;
}

export function FilterGroup({
  label,
  icon,
  expanded = false,
  onToggle,
  children,
}: FilterGroupProps) {
  return (
    <div className="border-t border-slate-200 dark:border-tournament-dark-border pt-3">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left gap-3 text-slate-700 dark:text-slate-200 font-semibold"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg text-purple-600">{icon}</span>
          <span>{label}</span>
        </div>
        <HiChevronDown
          className={`transition-transform ${
            expanded ? "rotate-180" : "rotate-0"
          }`}
          size={20}
        />
      </button>
      {expanded && <div className="mt-3 flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
