"use client";

import { useState, useMemo } from "react";
import { useTournamentStore } from "@/store";
import { RoundDisplay } from "./RoundDisplay";

export const SwissRoundManager = () => {
  const {
    tournament,
    players,
    rounds,
    generateRound,
    saveMatchResult,
    finalizeRound,
    finalizeTournament,
  } = useTournamentStore();

  const playersCount = players.length;
  const maxRounds = tournament?.maxRounds ?? 0;
  const isFinished = tournament?.status === "finished";

  const [end, setEnd] = useState(false);

  // Ronda actual
  const currentRound = useMemo(() => {
    if (rounds.length === 0) return undefined;
    return rounds[rounds.length - 1];
  }, [rounds]);

  const allMatchesResolved = currentRound?.matches?.every(
    (m) => m.result !== null
  );

  // Mostrar botón "Generar ronda"
  const showNewRound = () =>
    tournament && !isFinished && playersCount > 3 && rounds.length === 0;

  // Mostrar botón "Finalizar ronda"
  const showEndRound = () =>
    tournament &&
    currentRound &&
    !isFinished &&
    allMatchesResolved &&
    tournament.currentRoundNumber < tournament.maxRounds;

  // Mostrar botón "Finalizar torneo"
  const showFinalizeTournament = () =>
    tournament &&
    !isFinished &&
    tournament.maxRounds > 0 &&
    tournament.currentRoundNumber === tournament.maxRounds;

  const finalizeCurrentRound = async () => {
    if (!currentRound) return;
    setEnd(true);
    await finalizeRound();
  };

  const finalizeEntireTournament = async () => {
    await finalizeTournament();
  };

  const handleGenerateRound = async () => {
    setEnd(false);
    await generateRound();
  };

  const setResultRount = async (
    matchId: string,
    result: "P1" | "P2" | "DRAW",
    player2Nickname: string | null
  ) => {
    if (!currentRound) return;
    await saveMatchResult(matchId, result, player2Nickname);
  };

  return (
    <div className="p-4 border rounded-md bg-slate-50 border-gray-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-center font-bold uppercase mb-2">
          Rondas del torneo {maxRounds}
        </h2>

        {showNewRound() && (
          <button
            onClick={handleGenerateRound}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Generar Ronda
          </button>
        )}
        {showEndRound() && (
          <button
            onClick={finalizeCurrentRound}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Finalizar Ronda
          </button>
        )}
        {showFinalizeTournament() && (
          <button
            onClick={finalizeEntireTournament}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 ml-2"
          >
            Finalizar Torneo
          </button>
        )}
      </div>

      <RoundDisplay
        currentRound={currentRound}
        setResultRount={setResultRount}
      />
    </div>
  );
};
