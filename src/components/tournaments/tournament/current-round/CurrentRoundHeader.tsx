"use client";

import { useMemo } from "react";
import { useTournamentStore } from "@/store";
import { RoundProgressBar } from "./RoundProgressBar";
import { TournamentTimer } from "./TournamentTimer";
import { RoundActionButton } from "./RoundActionButton";

export const CurrentRoundHeader = () => {
  const { tournament, rounds } = useTournamentStore();

  // Ronda actual (última generada)
  const currentRound = useMemo(() => {
    if (rounds.length === 0) return undefined;
    return rounds[rounds.length - 1];
  }, [rounds]);

  if (!tournament) return null;

  return (
    <div className="w-full bg-white rounded-xl p-4 shadow-sm border flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Info de la ronda */}
      <div className="flex flex-col gap-2 flex-1">
        {/* Estado del torneo */}
        <span
          className={`w-fit px-3 py-1 rounded-full text-xs font-semibold
            ${
              tournament.status === "in_progress"
                ? "bg-green-100 text-green-700"
                : tournament.status === "finished"
                ? "bg-gray-200 text-gray-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
        >
          {tournament.status === "in_progress"
            ? "En progreso"
            : tournament.status === "finished"
            ? "Finalizado"
            : "Pendiente"}
        </span>

        {/* Número de ronda */}
        <h2 className="text-xl font-bold">
          Ronda {currentRound?.roundNumber ?? tournament.currentRoundNumber}
        </h2>

        {/* Progreso de partidas */}
        <RoundProgressBar round={currentRound} />
      </div>

      {/* Timer + Acción */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <TournamentTimer />

        {/* Separador visual (solo desktop) */}
        <div className="hidden md:block h-10 w-px bg-gray-300 mx-2" />

        <RoundActionButton />
      </div>
    </div>
  );
};
