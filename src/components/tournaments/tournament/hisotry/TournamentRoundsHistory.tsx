"use client";

import { useTournamentStore } from "@/store";
import { RoundHistoryCard } from "./RoundHistoryCard";
import { RoundTimelineIcon } from "./RoundTimelineIcon";

export const TournamentRoundsHistory = () => {
  const { rounds, tournament, players } = useTournamentStore();

  if (!tournament) return null;

  if (rounds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-tournament-dark-accent bg-white p-4 text-center text-slate-500 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300 sm:p-8">
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          Aún no hay rondas generadas
        </p>
        <p className="text-sm">
          Cuando se genere la primera ronda, aquí podrás ver el historial de
          emparejamientos y resultados.
        </p>
      </div>
    );
  }

  // Ordenar rondas: la última (currentRoundNumber + 1) primero, luego descendente
  const orderedRounds = [...rounds].sort((a, b) => {
    if (a.roundNumber === tournament.currentRoundNumber + 1) return -1;
    if (b.roundNumber === tournament.currentRoundNumber + 1) return 1;
    return b.roundNumber - a.roundNumber;
  });

  return (
    <div className="space-y-4">
      {orderedRounds.map((round, index) => (
        <div key={round.id} className="flex gap-4">
          {/* Timeline */}
          <div className="hidden sm:flex relative flex-col items-center">
            {/* Icono */}
            <RoundTimelineIcon round={round} tournament={tournament} />

            {/* Línea */}
            {index !== orderedRounds.length - 1 && (
              <div className="mt-1 w-px flex-1 bg-slate-200 dark:bg-tournament-dark-border" />
            )}
          </div>

          {/* Card */}
          <div className="flex-1">
            <RoundHistoryCard
              key={index}
              round={round}
              tournament={tournament}
              players={players}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
