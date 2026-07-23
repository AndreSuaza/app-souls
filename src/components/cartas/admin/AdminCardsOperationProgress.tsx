"use client";

import { useEffect, useMemo, useState } from "react";

type ProgressStep = {
  threshold: number;
  message: string;
};

type Props = {
  isActive: boolean;
  title: string;
  steps: ProgressStep[];
};

export const AdminCardsOperationProgress = ({
  isActive,
  title,
  steps,
}: Props) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    setProgress(8);
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 95) return current;
        const increment = current < 40 ? 7 : current < 75 ? 4 : 2;
        return Math.min(95, current + increment);
      });
    }, 700);

    return () => window.clearInterval(interval);
  }, [isActive]);

  const message = useMemo(() => {
    const step = steps.find((item) => progress <= item.threshold);
    return step?.message ?? steps[steps.length - 1]?.message ?? "Procesando...";
  }, [progress, steps]);

  if (!isActive) return null;

  return (
    <div className="space-y-2 rounded-xl border border-purple-500/30 bg-purple-50 p-4 dark:border-purple-500/40 dark:bg-purple-950/20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-purple-700 dark:text-purple-200">
            {title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            {message}
          </p>
        </div>
        <span className="text-sm font-semibold text-purple-700 dark:text-purple-200">
          {progress}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-purple-100 dark:bg-tournament-dark-muted">
        <div
          className="h-full rounded-full bg-purple-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
