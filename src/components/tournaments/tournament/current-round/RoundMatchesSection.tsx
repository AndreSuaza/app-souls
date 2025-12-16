"use client";

import { useTournamentStore } from "@/store";
import { MatchCard } from "./MarchCard";

export const RoundMatchesSection = () => {
  const { rounds, players } = useTournamentStore();

  const currentRound = rounds[rounds.length - 1];

  if (!currentRound) {
    return (
      <div className="bg-white border rounded-md p-6 text-gray-400 text-center">
        Aún no se ha generado la ronda
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Título */}
      <h3 className="text-lg font-semibold">Emparejamientos</h3>

      {/* Encabezados */}
      <div className="hidden md:grid grid-cols-[72px_1fr_220px_1fr_72px] text-xs font-semibold text-gray-500 px-4">
        <span className="text-left">Mesa</span>
        <span className="text-left">Jugador 1</span>
        <span className="text-center">Resultado</span>
        <span className="text-right">Jugador 2</span>
        <span className="text-right">Estado</span>
      </div>

      {/* Matches */}
      <div className="flex flex-col gap-3">
        {currentRound.matches.map((match, index) => (
          <MatchCard
            key={match.id}
            match={match}
            tableNumber={index + 1}
            players={players}
          />
        ))}
      </div>
    </div>
  );
};
