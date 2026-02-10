"use client";

import { FaStopCircle, FaCheckCircle, FaPlay } from "react-icons/fa";
import { useTournamentStore, useUIStore, useToastStore } from "@/store";

export const RoundActionButton = () => {
  const {
    tournament,
    rounds,
    players,
    generateRound,
    startCurrentRound,
    finalizeRound,
    finalizeTournament,
    setShowMissingDeckIndicator,
  } = useTournamentStore();

  const showLoading = useUIStore((s) => s.showLoading);
  const hideLoading = useUIStore((s) => s.hideLoading);
  const showToast = useToastStore((s) => s.showToast);

  if (!tournament) return null;

  const hasRounds = rounds.length > 0;
  const currentRound = hasRounds ? rounds[rounds.length - 1] : null;

  const isRoundStarted = !!currentRound?.startedAt;
  const allMatchesResolved =
    currentRound?.matches.every((m) => m.result !== null) ?? false;

  const isLastRound = tournament.currentRoundNumber === tournament.maxRounds;

  const canGenerateFirstRound =
    tournament.status !== "finished" && !hasRounds && players.length > 3;
  const requiresDeckAssociation = ["Tier 1", "Tier 2"].includes(
    tournament.typeTournamentName ?? ""
  );
  const missingDeckCount = players.filter((player) => !player.deckId).length;
  const hasAllPlayersDecks = missingDeckCount === 0;

  const validateDeckAssociation = (context: "tournament" | "round") => {
    // En torneos Tier 1/2 se exige mazo asociado antes de iniciar.
    if (!requiresDeckAssociation) return true;
    if (hasAllPlayersDecks) return true;

    // Redirige al tab de jugadores y habilita el aviso visual en la lista.
    window.dispatchEvent(
      new CustomEvent("changeTournamentTab", {
        detail: "players",
      }),
    );
    setShowMissingDeckIndicator(true);

    showToast(
      context === "tournament"
        ? `No puedes generar la ronda. Faltan ${missingDeckCount} jugadores por asociar mazo.`
        : `No puedes iniciar la ronda. Faltan ${missingDeckCount} jugadores por asociar mazo.`,
      "warning",
    );
    return false;
  };

  // Handlers con loading
  const handleGenerateRound = async () => {
    if (!validateDeckAssociation("tournament")) return;
    showLoading("Generando ronda");
    try {
      await generateRound();
    } catch {
      showToast("Error al generar la ronda", "error");
    } finally {
      hideLoading();
    }
  };

  const handleFinalizeRound = async () => {
    showLoading("Procesando ronda");
    try {
      await finalizeRound();
    } catch {
      showToast("Error al finalizar la ronda", "error");
    } finally {
      hideLoading();
    }
  };

  const handleFinalizeTournament = async () => {
    showLoading("Finalizando torneo");
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
        <FaPlay className="flex shrink-0" size={16} />
        Generar ronda
      </button>
    );
  }

  if (
    tournament.status !== "finished" &&
    hasRounds &&
    currentRound &&
    !isRoundStarted
  ) {
    return (
      <button
        onClick={async () => {
          if (!validateDeckAssociation("round")) return;
          showLoading("Iniciando ronda");
          try {
            await startCurrentRound();
          } catch {
            showToast("Error al iniciar la ronda", "error");
          } finally {
            hideLoading();
          }
        }}
        className="flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
      >
        <FaPlay className="flex shrink-0" size={16} />
        Iniciar ronda
      </button>
    );
  }

  // Siguiente ronda
  if (
    tournament.status !== "finished" &&
    hasRounds &&
    currentRound &&
    isRoundStarted &&
    !isLastRound
  ) {
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
        <FaStopCircle className="flex shrink-0" size={18} />
        Finalizar ronda
      </button>
    );
  }

  // Finalizar torneo
  if (
    tournament.status !== "finished" &&
    hasRounds &&
    isLastRound &&
    isRoundStarted
  ) {
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
        <FaCheckCircle className="flex shrink-0" size={18} />
        Finalizar torneo
      </button>
    );
  }

  return null;
};
