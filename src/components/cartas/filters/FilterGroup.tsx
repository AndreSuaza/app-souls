"use client";

import { type ReactNode } from "react";
import { HiChevronDown, HiFunnel } from "react-icons/hi2";

export interface FilterGroupProps {
  label: string;
  icon: ReactNode;
  hasSelection?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  children: ReactNode;
}

export function FilterGroup({
  label,
  icon,
  hasSelection = false,
  expanded = false,
  onToggle,
  children,
}: FilterGroupProps) {
  return (
    <div className="border-t border-slate-200 dark:border-tournament-dark-border pt-3">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-xs sm:text-base flex items-center justify-between text-left gap-3 text-slate-700 dark:text-slate-200 font-semibold"
      >
        <div className="flex items-center gap-2">
          <span className="text-purple-600 text-xs sm:text-lg">{icon}</span>
          <span>{label}</span>
          {hasSelection && <HiFunnel className="text-purple-500" size={14} />}
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
