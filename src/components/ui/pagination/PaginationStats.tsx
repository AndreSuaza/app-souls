"use client";

import clsx from "clsx";

interface Props {
  rangeText: string;
  entityLabel: string;
  className?: string;
  isLoading?: boolean;
  loadingText?: string;
}

export function PaginationStats({ rangeText, entityLabel, className }: Props) {
  return (
    <div
      className={clsx(
        "whitespace-nowrap text-xs text-slate-600 md:text-sm dark:text-slate-300",
        className,
      )}
    >
      Mostrando{" "}
      <span className="font-semibold text-slate-900 dark:text-white">
        {rangeText}
      </span>{" "}
      {entityLabel}:
    </div>
  );
}
