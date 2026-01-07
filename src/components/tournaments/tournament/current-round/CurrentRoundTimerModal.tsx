"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { titleFont } from "@/config/fonts";
import { useTournamentStore } from "@/store";
import { RoundProgressBar } from "./RoundProgressBar";
import { TournamentTimer } from "./TournamentTimer";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const CurrentRoundTimerModal = ({ open, onClose }: Props) => {
  const { tournament, rounds } = useTournamentStore();

  const currentRound = useMemo(() => {
    if (rounds.length === 0) return undefined;
    return rounds[rounds.length - 1];
  }, [rounds]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || !tournament) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-[0_25px_60px_rgba(15,23,42,0.25)] dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white/90 p-1 text-slate-600 shadow-sm hover:bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
          aria-label="Cerrar"
        >
          <IoCloseOutline className="h-6 w-6" />
        </button>

        <div className="space-y-6 px-4 sm:px-6 pb-6 pt-5 md:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Ronda actual
              </p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Ronda{" "}
                {currentRound?.roundNumber ?? tournament.currentRoundNumber}
                {tournament.maxRounds > 1 && ` de ${tournament.maxRounds}`}
              </h2>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset md:mr-8 ${
                tournament.status === "in_progress"
                  ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-500/30"
                  : tournament.status === "finished"
                  ? "bg-slate-200 text-slate-700 ring-slate-300 dark:bg-tournament-dark-muted dark:text-slate-400 dark:ring-tournament-dark-accent"
                  : "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-500/30"
              }`}
            >
              {tournament.status === "in_progress"
                ? "En progreso"
                : tournament.status === "finished"
                ? "Finalizado"
                : "Pendiente"}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
            <RoundProgressBar round={currentRound} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-3 sm:px-5 py-6 shadow-[inset_0_1px_10px_rgba(15,23,42,0.08)] dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                Tiempo transcurrido
              </p>
              <TournamentTimer
                classNames={{
                  container: "gap-2 sm:gap-3 md:gap-4 lg:gap-5",
                  box: "px-4 py-4 min-w-[60px] sm:px-9 sm:py-6 sm:min-w-[150px] md:px-12 md:py-8 md:min-w-[200px] lg:px-14 lg:py-9 lg:min-w-[230px]",
                  value: "text-5xl md:text-6xl lg:text-7xl leading-none",
                  label: "text-lg md:text-xl lg:text-2xl text-slate-500 dark:text-slate-400",
                  separator: "text-lg md:text-2xl lg:text-3xl",
                }}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <div className="flex items-center pointer-events-none">
              <Image
                src="/souls-in-xtinction-logo-sm.png"
                alt="logo-icono-souls-in-xtinction"
                className="w-12 h-12"
                width={40}
                height={40}
              />
              <span
                className={`${titleFont.className} antialiased font-bold ml-2 text-xl text-slate-900 dark:text-white`}
              >
                {" "}
                Souls In Xtinction | TCG
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
