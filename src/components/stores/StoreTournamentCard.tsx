"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IoChevronDownOutline } from "react-icons/io5";
import { StorePendingTournament } from "@/interfaces";
import { MarkdownContent } from "@/components/ui/markdown/MarkdownContent";

interface Props {
  tournament: StorePendingTournament;
}

const formatLabel = (value: string) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getDateParts = (value: string) => {
  const date = new Date(value);

  // Se formatea en espanol para replicar el estilo de calendario solicitado.
  const weekday = formatLabel(
    date.toLocaleDateString("es-CO", { weekday: "long" }),
  );
  const month = formatLabel(
    date.toLocaleDateString("es-CO", { month: "long" }),
  );
  const day = date.toLocaleDateString("es-CO", { day: "2-digit" });
  const time = date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { weekday, month, day, time };
};

export function StoreTournamentCard({ tournament }: Props) {
  const { weekday, month, day, time } = getDateParts(tournament.date);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const measureOverflow = () => {
      if (!contentRef.current) return;
      if (expanded) return;

      const contentHeight = contentRef.current.scrollHeight;
      const visibleHeight = contentRef.current.clientHeight;
      const shouldExpand = contentHeight > visibleHeight + 4;
      setCanExpand(shouldExpand);

      if (!shouldExpand && expanded) {
        setExpanded(false);
      }
    };

    const raf = requestAnimationFrame(measureOverflow);
    const handleResize = () => measureOverflow();
    window.addEventListener("resize", handleResize);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measureOverflow)
        : null;

    if (observer && contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  }, [expanded, tournament.id]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/90 p-4 pb-8 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface/90">
      <div className="flex flex-wrap items-stretch justify-between gap-4">
        <div className="flex min-h-full flex-col items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {tournament.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              {time}
            </p>
          </div>

          <Link
            href={`/torneos/${tournament.id}`}
            className="inline-flex items-center justify-center rounded-lg border border-purple-600 px-4 py-2 text-xs font-semibold text-purple-600 transition hover:bg-purple-600 hover:text-white dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-500 dark:hover:text-white"
          >
            Ir al torneo
          </Link>
        </div>

        <div className="flex w-28 flex-col items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-center text-slate-600 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200">
          <span className="text-[11px] font-semibold uppercase tracking-wide">
            {weekday}
          </span>
          <span className="text-sm font-medium">{month}</span>
          <span className="text-3xl font-bold text-slate-900 dark:text-white">
            {day}
          </span>
        </div>
      </div>

      <div className="relative">
        <div
          ref={contentRef}
          className={`space-y-3 overflow-hidden text-sm text-slate-600 dark:text-slate-200 ${
            expanded
              ? "max-h-[2000px] transition-[max-height] duration-300 ease-out"
              : "max-h-64"
          }`}
        >
          <MarkdownContent content={tournament.description} />
        </div>

        {!expanded && canExpand && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
            <div className="h-16 w-full bg-gradient-to-t from-white via-white/90 to-transparent dark:from-tournament-dark-surface/95 dark:via-tournament-dark-surface/80" />
            <div className="pointer-events-auto -mt-10 flex w-full justify-center pb-1">
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-300 dark:hover:text-purple-200"
              >
                Mostrar más
                <IoChevronDownOutline className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {expanded && canExpand && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-300 dark:hover:text-purple-200"
            >
              Mostrar menos
              <IoChevronDownOutline className="h-4 w-4 rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
