"use client";

import { useMemo } from "react";
import { useTournamentStore } from "@/store";
import { MatchCard } from "./MarchCard";
import { orderMatchesByBye } from "@/utils/matches";

export const RoundMatchesSection = () => {
  const { rounds, players } = useTournamentStore();

  const currentRound = rounds[rounds.length - 1];
  const orderedMatches = useMemo(
    () => orderMatchesByBye(currentRound?.matches ?? []),
    [currentRound?.matches],
  );

  if (!currentRound) {
    return (
      <div className="rounded-xl border border-tournament-dark-accent bg-white p-6 text-center text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
        Aún no se ha generado la ronda
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Título */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        Emparejamientos
      </h3>

      {/* Encabezados */}
      <div className="hidden md:grid grid-cols-[72px_1fr_220px_1fr_72px] text-xs font-semibold text-slate-500 dark:text-slate-400 px-4">
        <span className="text-left">Mesa</span>
        <span className="text-left">Jugador 1</span>
        <span className="text-center">Resultado</span>
        <span className="text-right">Jugador 2</span>
        <span className="text-right">Estado</span>
      </div>

      {/* Matches */}
      <div className="flex flex-col gap-3">
        {orderedMatches.map((match, index) => (
          <MatchCard
            key={match.id}
            match={match}
            tableNumber={index + 1}
            players={players}
            readOnly={!currentRound.startedAt}
            classNames={{
              container:
                "bg-white border-tournament-dark-accent dark:bg-tournament-dark-surface",
              tableBadge:
                "bg-slate-100 text-slate-700 dark:bg-tournament-dark-muted dark:text-slate-200",
              tableText: "text-slate-700 dark:text-slate-200",
              byeText: "text-slate-400 dark:text-slate-500",
              byeImage: "border-slate-200 dark:border-tournament-dark-border",
            }}
          />
        ))}
      </div>
    </div>
  );
};
