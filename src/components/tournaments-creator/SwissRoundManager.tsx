"use client";

import { useState, useMemo } from "react";
import { PairingButtons } from "./PairingButtons";
import { useTournamentStore } from "@/store";

export const SwissRoundManager = () => {
  const {
    tournament,
    generateRound,
    saveMatchResult,
    finalizeRound,
    finalizeTournament,
  } = useTournamentStore();

  const rounds = tournament?.tournamentRounds ?? [];
  const playersCount = tournament?.tournamentPlayers.length ?? 0;
  const maxRounds = tournament?.maxRounds ?? 0;

  const [end, setEnd] = useState(false);

  // Ronda actual = última ronda generada
  const currentRound = useMemo(() => {
    if (!rounds.length) return undefined;
    return rounds[rounds.length - 1];
  }, [rounds]);

  const allMatchesResolved = currentRound?.matches?.every(
    (m) => m.result !== null
  );

  const roundIsFinished = currentRound?.status === "finished";

  // Mostrar botón "Generar ronda"
  const showNewRound = () => {
    if (!tournament) return false;
    if (tournament.status === "finished") return false;
    if (playersCount <= 3) return false;

    // No más rondas que el máximo
    if (rounds.length >= tournament.maxRounds) return false;

    // Si NO hay rondas, permitir generar la primera
    if (!currentRound) return true;

    // Si hay ronda y NO ha finalizado, NO permitir generar la siguiente
    if (currentRound.status !== "finished") return false;

    return true;
  };

  // Mostrar botón "Finalizar ronda"
  const showEndRound = () => {
    if (!tournament || !currentRound) return false;
    if (tournament.status === "finished") return false;

    // Si la ronda ya fue finalizada (currentRoundNumber >= roundNumber), no mostrar botón
    if (roundIsFinished) return false;

    // Si NO todos los matches están resueltos, no permitir finalizar
    if (!allMatchesResolved) return false;

    return true;
  };

  // Mostrar botón "Finalizar torneo"
  const showFinalizeTournament = () => {
    if (!tournament) return false;
    return tournament.status === "pending_finalization";
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
    await generateRound(); // genera ronda en backend + recarga torneo en store
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

      <div className="py-2 px-4 border rounded-md bg-slate-50 border-gray-300">
        <h3 className="text-lg font-semibold uppercase text-gray-700 mb-2">
          Ronda {currentRound?.roundNumber}
        </h3>

        <ul>
          {currentRound?.matches?.map((match, idx) => (
            <li
              key={match.id}
              className="grid grid-cols-6 gap-2 text-center p-1 border rounded mb-2"
            >
              <PairingButtons
                index={idx}
                setResultRount={setResultRount}
                match={match}
                disabled={
                  match.status === "finished" ||
                  match.player2Nickname === "BYE" ||
                  roundIsFinished
                }
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
