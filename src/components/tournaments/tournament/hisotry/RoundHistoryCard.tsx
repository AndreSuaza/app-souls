"use client";

import { useState } from "react";
import { IoPencil, IoSave, IoClose } from "react-icons/io5";
import { RoundInterface, TournamentPlayerInterface } from "@/interfaces";
import {
  BasicTournament,
  useTournamentStore,
  useAlertConfirmationStore,
  useUIStore,
  useToastStore,
} from "@/store";
import { RoundHistoryCardBase } from "./RoundHistoryCardBase";

interface Props {
  round: RoundInterface;
  tournament: BasicTournament;
  players: TournamentPlayerInterface[];
}

export const RoundHistoryCard = ({ round, tournament, players }: Props) => {
  const { editRoundResults, recalculateCurrentRound, rounds } =
    useTournamentStore();
  const openAlertConfirmation = useAlertConfirmationStore(
    (s) => s.openAlertConfirmation
  );
  const { showLoading, hideLoading } = useUIStore();
  const showToast = useToastStore((s) => s.showToast);

  // Estado de la ronda calculado inline
  const lastRoundNumber =
    tournament.status === "finished"
      ? tournament.currentRoundNumber
      : tournament.currentRoundNumber + 1;

  const isLastRound = round.roundNumber === lastRoundNumber;

  // Controla si esta ronda esta en modo edicion
  const [isEditing, setIsEditing] = useState(false);
  // Controla si la card está expandida
  const [expanded, setExpanded] = useState(isLastRound);

  // Copia local editable de los matchs (NO se guarda hasta confirmar)
  const [editableMatches, setEditableMatches] = useState(round.matches);

  const status =
    tournament.status === "in_progress" && isLastRound
      ? "IN_PROGRESS"
      : "FINISHED";

  // Determina si la ronda puede editarse
  const canEditRound =
    tournament.status === "in_progress" &&
    round.roundNumber < tournament.currentRoundNumber + 1;

  const TEN_MINUTES_MS = 10 * 60 * 1000;

  const handleEdit = () => {
    // Si es la ronda actual, ir a pestana Ronda actual
    if (status === "IN_PROGRESS") {
      window.dispatchEvent(
        new CustomEvent("changeTournamentTab", {
          detail: "currentRound",
        })
      );
      return;
    }

    setEditableMatches(structuredClone(round.matches));
    setExpanded(true); // abre la card al editar
    setIsEditing(true);
  };

  const handleSave = () => {
    openAlertConfirmation({
      text: "Guardar cambios de la ronda",
      description:
        "¿Estas seguro de que deseas guardar los cambios realizados en esta ronda?",
      action: async () => {
        try {
          showLoading("Guardando resultados de la ronda...");

          await editRoundResults(round.roundNumber, editableMatches);

          setIsEditing(false);

          showToast("Ronda editada correctamente.", "success");

          const currentRound =
            rounds.length > 0 ? rounds[rounds.length - 1] : null;
          const isCurrentRound =
            currentRound?.roundNumber === tournament.currentRoundNumber + 1;

          // Si existe ronda actual, se decide el recalc segun el estado del inicio.
          if (currentRound && isCurrentRound) {
            if (!currentRound.startedAt) {
              showLoading("Recalculando ronda...");
              try {
                const success = await recalculateCurrentRound();
                if (success) {
                  showToast("Ronda recalculada", "info");
                } else {
                  showToast("Error al recalcular la ronda", "error");
                }
              } finally {
                hideLoading();
              }
            } else {
              const startedAtMs = new Date(currentRound.startedAt).getTime();
              const elapsed = Date.now() - startedAtMs;

              if (!Number.isNaN(startedAtMs) && elapsed < TEN_MINUTES_MS) {
                hideLoading();
                openAlertConfirmation({
                  text: "¿Recalcular la ronda actual?",
                  description:
                    "Se reiniciara la ronda y se generaran nuevos emparejamientos.",
                  action: async () => {
                    showLoading("Recalculando ronda...");
                    try {
                      return await recalculateCurrentRound();
                    } finally {
                      hideLoading();
                    }
                  },
                  onSuccess: () => {
                    showToast("Ronda recalculada", "info");
                  },
                  onError: () => {
                    showToast("Error al recalcular la ronda", "error");
                  },
                });
              }
            }
          }

          return true;
        } catch {
          showToast(
            "Ocurrio un error al guardar los cambios de la ronda.",
            "error"
          );

          return false;
        } finally {
          hideLoading();
        }
      },
    });
  };

  const handleCancel = () => {
    setEditableMatches(round.matches);
    setIsEditing(false);
  };

  // Actualiza el resultado de un match SOLO en la copia local editable
  const handleLocalResultChange = (
    matchId: string,
    result: "P1" | "P2" | "DRAW"
  ) => {
    setEditableMatches((prev) =>
      prev.map((match) => (match.id === matchId ? { ...match, result } : match))
    );
  };

  return (
    <RoundHistoryCardBase
      round={round}
      players={players}
      status={status}
      matches={isEditing ? editableMatches : round.matches}
      readOnly={!isEditing}
      onChangeResult={isEditing ? handleLocalResultChange : undefined}
      defaultExpanded={isLastRound}
      allowExpand
      expanded={expanded}
      onToggleExpand={setExpanded}
      maxVisibleMatches={4}
      classNames={{
        container:
          "bg-white dark:bg-tournament-dark-surface border border-tournament-dark-accent dark:border-tournament-dark-border",
        title: "text-slate-900 dark:text-white",
        metaText: "text-slate-500 dark:text-slate-400",
        divider: "border-slate-200 dark:border-tournament-dark-border",
        matchDivider: "border-slate-200 dark:border-tournament-dark-border",
        expandButton:
          "border-slate-200 text-slate-600 dark:border-tournament-dark-border dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-tournament-dark-muted",
        showAllButton:
          "text-purple-600 hover:text-purple-600/80 dark:text-purple-600 dark:hover:text-purple-600/80",
      }}
      matchCardClassNames={{
        container: "bg-white dark:bg-tournament-dark-surface",
        tableBadge:
          "bg-slate-100 text-slate-700 dark:bg-tournament-dark-muted dark:text-slate-200",
        tableText: "text-slate-700 dark:text-slate-200",
        byeText: "text-slate-400 dark:text-slate-500",
        byeImage: "border-slate-200 dark:border-tournament-dark-border",
      }}
      headerActions={
        <>
          {canEditRound && !isEditing && (
            <button
              onClick={handleEdit}
              title="Editar ronda"
              className="p-1 text-sm rounded bg-purple-600 text-white hover:bg-purple-600/90"
            >
              <IoPencil />
            </button>
          )}

          {isEditing && (
            <>
              <button
                onClick={handleSave}
                title="Guardar cambios"
                className="p-1 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <IoSave />
              </button>

              <button
                onClick={handleCancel}
                title="Cancelar edicion"
                className="p-1 text-sm rounded bg-rose-600 text-white hover:bg-rose-700"
              >
                <IoClose />
              </button>
            </>
          )}
        </>
      }
    />
  );
};
