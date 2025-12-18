"use client";

import { useTournamentStore } from "@/store";
import { RoundHistoryCard } from "./RoundHistoryCard";
import { RoundTimelineIcon } from "./RoundTimelineIcon";

export const TournamentRoundsHistory = () => {
  const { rounds, tournament, players } = useTournamentStore();

  if (!tournament) return null;

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
          <div className="relative flex flex-col items-center">
            {/* Icono */}
            <RoundTimelineIcon round={round} tournament={tournament} />

            {/* Línea */}
            {index !== orderedRounds.length - 1 && (
              <div className="flex-1 w-px bg-gray-300 mt-1" />
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
