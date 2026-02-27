"use client";

interface Props {
  priceLabel: string;
  priceValue: string;
}

export function BovedaPriceCard({ priceLabel, priceValue }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {priceLabel}
      </p>
      <p className="mt-3 text-2xl font-extrabold text-purple-600 dark:text-purple-300">
        {priceValue}
      </p>
    </div>
  );
}
