"use client";

import clsx from "clsx";

type RoundStatus = "IN_PROGRESS" | "FINISHED";

interface Props {
  status: RoundStatus;
}

export const RoundStatusBadge = ({ status }: Props) => {
  return (
    <span
      className={clsx(
        "px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset",
        status === "IN_PROGRESS"
          ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-500/30"
          : "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-500/30"
      )}
    >
      {status === "IN_PROGRESS" ? "En progreso" : "Finalizada"}
    </span>
  );
};
