"use client";

import { MdTimer } from "react-icons/md";

type Props = {
  value: string;
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  const day = date.toLocaleDateString("es-CO", { day: "2-digit" });
  const rawMonth = date.toLocaleDateString("es-CO", { month: "short" });
  const month = rawMonth.replace(".", "");
  const monthLabel = month
    ? `${month.charAt(0).toUpperCase()}${month.slice(1)}`
    : month;
  const year = date.getFullYear();
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${day} ${monthLabel}, ${year} ${formattedTime}`;
};

export function PublicTournamentsDateBadge({ value }: Props) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-[#4d3267] dark:bg-[#1f152a] dark:text-slate-200">
      <MdTimer className="text-purple-600 text-sm" />
      {formatDateTime(value)}
    </span>
  );
}
