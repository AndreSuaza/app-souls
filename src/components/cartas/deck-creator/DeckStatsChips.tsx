"use client";

import clsx from "clsx";

interface DeckStats {
  total: number;
  und: number;
  con: number;
  arm: number;
  ent: number;
}

interface DeckStatsChipsProps {
  stats: DeckStats;
}

export const DeckStatsChips = ({ stats }: DeckStatsChipsProps) => {
  const statItemBaseClass =
    "flex items-center gap-1 rounded-md border border-l-4 border-slate-200 bg-white/80 px-2 py-1 text-[11px] sm:text-xs font-semibold text-slate-700 dark:border-slate-700/70 dark:bg-slate-950/80 dark:text-slate-100";
  const statItems = [
    {
      key: "T",
      value: stats.total,
      borderClass: "border-l-slate-300 dark:border-l-slate-100",
      textClass: "text-slate-700 dark:text-slate-100",
    },
    {
      key: "U",
      value: stats.und,
      borderClass: "border-l-rose-500 dark:border-l-rose-400",
      textClass: "text-rose-600 dark:text-rose-300",
    },
    {
      key: "C",
      value: stats.con,
      borderClass: "border-l-purple-500 dark:border-l-purple-400",
      textClass: "text-purple-600 dark:text-purple-300",
    },
    {
      key: "A",
      value: stats.arm,
      borderClass: "border-l-sky-400 dark:border-l-sky-300",
      textClass: "text-sky-600 dark:text-sky-300",
    },
    {
      key: "E",
      value: stats.ent,
      borderClass: "border-l-amber-400 dark:border-l-amber-300",
      textClass: "text-amber-500 dark:text-amber-300",
    },
  ];

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {statItems.map((stat) => (
        <li
          key={stat.key}
          className={clsx(statItemBaseClass, stat.borderClass)}
        >
          <span className={clsx("font-bold", stat.textClass)}>
            {stat.key}:
          </span>
          <span className={stat.textClass}>{stat.value}</span>
        </li>
      ))}
    </ul>
  );
};
