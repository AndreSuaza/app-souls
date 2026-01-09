"use client";

type Variant = "p1" | "draw" | "p2";

interface Props {
  label: string;
  active: boolean;
  onClick: () => void;
  variant: Variant;
  readOnly?: boolean;
}

export const ResultButton = ({
  label,
  active,
  onClick,
  variant,
  readOnly,
}: Props) => {
  const base =
    "px-3 py-1 rounded-md text-sm font-semibold select-none transition";

  const cursor = readOnly ? "cursor-default" : "cursor-pointer";

  // Define el estilo del boton
  const stylesByVariant: Record<Variant, { active: string; idle: string }> = {
    p1: {
      active: "bg-blue-600 text-white dark:bg-blue-500",
      idle: readOnly
        ? "bg-slate-100 text-slate-400 dark:bg-tournament-dark-muted dark:text-slate-500"
        : "bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700 dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-blue-500/20 dark:hover:text-blue-200",
    },
    draw: {
      active: "bg-yellow-500 text-white dark:bg-yellow-400",
      idle: readOnly
        ? "bg-slate-100 text-slate-400 dark:bg-tournament-dark-muted dark:text-slate-500"
        : "bg-slate-100 text-slate-700 hover:bg-yellow-100 hover:text-yellow-700 dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-yellow-500/20 dark:hover:text-yellow-200",
    },
    p2: {
      active: "bg-rose-600 text-white dark:bg-rose-500",
      idle: readOnly
        ? "bg-slate-100 text-slate-400 dark:bg-tournament-dark-muted dark:text-slate-500"
        : "bg-slate-100 text-slate-700 hover:bg-rose-100 hover:text-rose-700 dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-rose-500/20 dark:hover:text-rose-200",
    },
  };

  return (
    <button
      onClick={readOnly ? undefined : onClick}
      className={`${base} ${cursor} ${
        active ? stylesByVariant[variant].active : stylesByVariant[variant].idle
      }`}
    >
      {label}
    </button>
  );
};
