"use client";

import { FaStopCircle, FaCheckCircle, FaPlay } from "react-icons/fa";
import { useTournamentStore, useUIStore, useToastStore } from "@/store";

export const RoundActionButton = () => {
  const {
    tournament,
    rounds,
    players,
    generateRound,
    finalizeRound,
    finalizeTournament,
  } = useTournamentStore();

  const showLoading = useUIStore((s) => s.showLoading);
  const hideLoading = useUIStore((s) => s.hideLoading);
  const showToast = useToastStore((s) => s.showToast);

  if (!tournament) return null;

  const hasRounds = rounds.length > 0;
  const currentRound = hasRounds ? rounds[rounds.length - 1] : null;

  const allMatchesResolved =
    currentRound?.matches.every((m) => m.result !== null) ?? false;

  const isLastRound = tournament.currentRoundNumber === tournament.maxRounds;

  const canGenerateFirstRound =
    tournament.status !== "finished" && !hasRounds && players.length > 3;

  // Handlers con loading
  const handleGenerateRound = async () => {
    showLoading("Generando ronda…");
    try {
      await generateRound();
    } catch {
      showToast("Error al generar la ronda", "error");
    } finally {
      hideLoading();
    }
  };

  const handleFinalizeRound = async () => {
    showLoading("Procesando ronda…");
    try {
      await finalizeRound();
    } catch {
      showToast("Error al finalizar la ronda", "error");
    } finally {
      hideLoading();
    }
  };

  const handleFinalizeTournament = async () => {
    showLoading("Finalizando torneo…");
    try {
      await finalizeTournament();
      showToast("Torneo finalizado", "info");
    } catch {
      showToast("Error al finalizar el torneo", "error");
    } finally {
      hideLoading();
    }
  };

  // Generar primera ronda
  if (canGenerateFirstRound) {
    return (
      <button
        onClick={handleGenerateRound}
        className="flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
      >
        <FaPlay className="hidden sm:flex" size={16} />
        Generar ronda
      </button>
    );
  }

  // Finalizar torneo
  if (tournament.status !== "finished" && hasRounds && isLastRound) {
    return (
      <button
        onClick={handleFinalizeTournament}
        disabled={!allMatchesResolved}
        className={`flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg font-semibold text-white
          ${
            allMatchesResolved
              ? "bg-red-600 hover:bg-red-700"
              : "bg-red-300 cursor-not-allowed"
          }`}
      >
        <FaCheckCircle className="hidden sm:flex" size={18} />
        Finalizar torneo
      </button>
    );
  }

  // Siguiente ronda
  if (tournament.status !== "finished" && hasRounds) {
    return (
      <button
        onClick={handleFinalizeRound}
        disabled={!allMatchesResolved}
        className={`flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg font-semibold text-white
          ${
            allMatchesResolved
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-indigo-300 cursor-not-allowed"
          }`}
      >
        <FaStopCircle className="hidden sm:flex" size={18} />
        Finalizar ronda
      </button>
    );
  }

  return null;
};
