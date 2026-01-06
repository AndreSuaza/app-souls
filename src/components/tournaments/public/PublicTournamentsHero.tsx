"use client";

import { useEffect, useState } from "react";
import { MdTimer } from "react-icons/md";

const HERO_TOURNAMENT = {
  title: "Torneo Nacional Souls In Xtinction",
  startDate: "2026-02-15T18:00:00-05:00",
};

const formatCountdown = (diffMs: number) => {
  if (diffMs <= 0 || Number.isNaN(diffMs)) return "En curso";
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return `${String(days).padStart(2, "0")}d ${String(hours).padStart(
    2,
    "0"
  )}h ${String(minutes).padStart(2, "0")}m`;
};

export function PublicTournamentsHero() {
  const [countdown, setCountdown] = useState("Calculando...");

  useEffect(() => {
    const targetDate = new Date(HERO_TOURNAMENT.startDate);

    const updateCountdown = () => {
      // Calcula el contador en cliente para evitar desfases en SSR.
      const diffMs = targetDate.getTime() - Date.now();
      setCountdown(formatCountdown(diffMs));
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-none sm:rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-[#362348] dark:bg-[#1a1122]">
      <div className="absolute inset-0 bg-[url('/tournaments/SMCC-baner.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/40 dark:from-black/50 dark:via-black/60 dark:to-black/70" />

      <div className="relative flex md:w-1/2 flex-col items-start gap-4 px-6 py-12 text-left md:px-10">
        <h1 className="text-2xl font-black text-white md:text-5xl">
          {HERO_TOURNAMENT.title}
        </h1>

        <div className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/90 p-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-[#362348] dark:bg-[#1a1122]/70 dark:text-slate-200">
          <MdTimer className="text-purple-600 text-lg" />
          <span>Inicia en: {countdown}</span>
        </div>

        <button
          type="button"
          className="rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:bg-purple-700 dark:shadow-[0_0_20px_rgba(115,17,212,0.4)] dark:hover:shadow-[0_0_30px_rgba(115,17,212,0.6)]"
        >
          Ver información
        </button>
      </div>
    </section>
  );
}
