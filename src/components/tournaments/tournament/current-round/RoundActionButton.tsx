"use client";

import { useState } from "react";
import { FaStopCircle, FaCheckCircle, FaPlay } from "react-icons/fa";
import { useTournamentStore, useUIStore, useToastStore } from "@/store";
import { isTopCutStage, isTopCutTournamentType } from "@/logic";
import { TopCutGenerateModal } from "./TopCutGenerateModal";

export const RoundActionButton = () => {
  const [isTopCutModalOpen, setIsTopCutModalOpen] = useState(false);
  const {
    tournament,
    rounds,
    players,
    generateRound,
    generateTopCutBracket,
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
  const currentRoundStage = currentRound?.stage ?? "SWISS";
  const currentRoundIsTopCut = isTopCutStage(currentRoundStage);
  const currentRoundIsTopCutFinal = currentRoundStage === "TOP8_FINAL";
  const currentRoundIsFinished = !!currentRound?.finishedAt;
  const requiresTopCut = isTopCutTournamentType(tournament.typeTournamentName);
  const canShowTopCutGeneration =
    tournament.status !== "finished" &&
    requiresTopCut &&
    !tournament.topCutGeneratedAt &&
    hasRounds &&
    currentRound &&
    !currentRoundIsTopCut &&
    isLastRound &&
    isRoundStarted &&
    allMatchesResolved;
  const hasEnoughTopCutPlayers = players.length >= 8;
  const canGenerateTopCut = canShowTopCutGeneration && hasEnoughTopCutPlayers;

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

  const handleGenerateTopCut = async (topCutPvBonus: number) => {
    showLoading("Generando bracket Top 8");
    try {
      await generateTopCutBracket(topCutPvBonus);
      setIsTopCutModalOpen(false);
      showToast("Bracket Top 8 generado", "info");
    } catch {
      showToast("Error al generar el bracket Top 8", "error");
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

  if (canShowTopCutGeneration) {
    return (
      <>
        <button
          onClick={() => {
            if (!canGenerateTopCut) {
              showToast("Se requieren al menos 8 jugadores para generar Top 8", "warning");
              return;
            }
            setIsTopCutModalOpen(true);
          }}
          className={`flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg font-semibold text-white ${
            canGenerateTopCut
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-amber-300 cursor-not-allowed"
          }`}
        >
          <FaPlay className="flex shrink-0" size={16} />
          Generar Top 8
        </button>
        <TopCutGenerateModal
          open={isTopCutModalOpen}
          onClose={() => setIsTopCutModalOpen(false)}
          onConfirm={handleGenerateTopCut}
        />
      </>
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
    ((!currentRoundIsTopCut && !isLastRound) ||
      (currentRoundIsTopCut &&
        (!currentRoundIsTopCutFinal || !currentRoundIsFinished)))
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
    isRoundStarted &&
    ((!requiresTopCut && isLastRound) ||
      (requiresTopCut && currentRoundIsTopCutFinal && currentRoundIsFinished))
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
