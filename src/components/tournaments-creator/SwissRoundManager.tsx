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

  const roundIsFinished = currentRound?.status === "finished";

  // Mostrar botón "Generar ronda"
  const showNewRound = () => {
    if (!tournament) return false;
    if (isFinished) return false;
    if (playersCount <= 3) return false;

    if (rounds.length >= maxRounds) return false;

    if (!currentRound) return true;

    if (currentRound.status !== "finished") return false;

    return true;
  };

  // Mostrar botón "Finalizar ronda"
  const showEndRound = () => {
    if (!tournament || !currentRound) return false;
    if (isFinished) return false;
    if (roundIsFinished) return false;
    if (!allMatchesResolved) return false;
    return true;
  };

  // Mostrar botón "Finalizar torneo"
  const showFinalizeTournament = () => {
    return tournament?.status === "pending_finalization";
  };

  const finalizeCurrentRound = async () => {
    if (!currentRound) return;
    setEnd(true);
    await finalizeRound(currentRound.id);
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
    result: "P1" | "P2" | "DRAW"
  ) => {
    if (!currentRound || roundIsFinished) return;
    await saveMatchResult(matchId, result);
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
        roundIsFinished={roundIsFinished}
        setResultRount={setResultRount}
      />
    </div>
  );
};
