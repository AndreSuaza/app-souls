"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MdTimer } from "react-icons/md";

type HeroTournament = {
  id: string;
  title: string;
  date: string;
  status: "pending" | "in_progress";
} | null;

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

type Props = {
  tournament: HeroTournament;
};

export function PublicTournamentsHero({ tournament }: Props) {
  const [countdown, setCountdown] = useState("Calculando...");

  useEffect(() => {
    if (!tournament?.date) {
      setCountdown("Por confirmar");
      return;
    }

    const targetDate = new Date(tournament.date);

    const updateCountdown = () => {
      // Calcula el contador en cliente para evitar desfases en SSR.
      const diffMs = targetDate.getTime() - Date.now();
      setCountdown(formatCountdown(diffMs));
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 60000);

    return () => clearInterval(intervalId);
  }, [tournament?.date]);

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

  return (
    <section className="relative overflow-hidden rounded-none sm:rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-tournament-dark-border dark:bg-tournament-dark-hero">
      <div className="absolute inset-0 bg-[url('/tournaments/SMCC-baner.jpg')] bg-cover bg-top" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/40 dark:from-black/50 dark:via-black/60 dark:to-black/70" />

      <div className="relative flex md:w-1/2 flex-col items-start gap-4 px-6 py-12 text-left md:px-10">
        <h1 className="text-3xl font-black text-white md:text-5xl">
          {tournament?.title ?? "Torneo nacional"}
        </h1>

        <div className="grid grid-cols-[auto,1fr] items-center gap-3 rounded-xl border border-white/30 bg-white/90 px-4 py-3 text-slate-700 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-hero/70 dark:text-slate-200">
          {/* Columna 1: Icono */}
          <div className="flex items-start justify-center pt-1">
            <MdTimer className="text-purple-600 text-2xl md:text-3xl" />
          </div>

          {/* Columna 2: Fecha + Countdown */}
          <div className="flex flex-col gap-1">
            {tournament?.date && (
              <div className="text-sm font-semibold">
                {formatDateTime(tournament.date)}
              </div>
            )}

            <div className="text-base md:text-lg font-bold">
              Inicia en: <span>{countdown}</span>
            </div>
          </div>
        </div>

        <Link
          href={tournament?.id ? `/torneos/${tournament.id}` : "/torneos"}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:bg-purple-700 dark:shadow-[0_0_20px_rgba(115,17,212,0.4)] dark:hover:shadow-[0_0_30px_rgba(115,17,212,0.6)]"
        >
          Ver información
        </Link>
      </div>
    </section>
  );
}
