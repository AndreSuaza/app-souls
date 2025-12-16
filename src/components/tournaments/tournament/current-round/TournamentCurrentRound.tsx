"use client";

import { CurrentRoundHeader } from "./CurrentRoundHeader";
import { RoundMatchesSection } from "./RoundMatchesSection";

export const TournamentCurrentRound = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Header superior: ronda, estado, progreso, timer y acción */}
      <CurrentRoundHeader />

      {/* Seccion de rondas */}
      <RoundMatchesSection />
    </div>
  );
};
