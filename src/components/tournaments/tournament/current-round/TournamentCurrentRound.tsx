"use client";

import { CurrentRoundHeader } from "./CurrentRoundHeader";
import { RoundMatchesSection } from "./RoundMatchesSection";
import { TopCutBracket } from "../top-cut/TopCutBracket";
import { useTournamentStore } from "@/store";
import { isTopCutTournamentType } from "@/logic";

export const TournamentCurrentRound = () => {
  const { tournament, rounds, players } = useTournamentStore();
  const showTopCutSection = isTopCutTournamentType(
    tournament?.typeTournamentName,
  );

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {/* Header superior: ronda, estado, progreso, timer y acción */}
      <CurrentRoundHeader />

      {showTopCutSection && (
        <TopCutBracket rounds={rounds} players={players} />
      )}

      {/* Seccion de rondas */}
      <RoundMatchesSection />
    </div>
  );
};
