"use client";

interface Props {
  label: string;
  value: string;
}

export function CardDetailStatCard({ label, value }: Props) {
  return (
    <div className="rounded-lg border border-purple-600 bg-white px-4 py-3 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80 dark:shadow-inner">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}
