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
  const { editRoundResults } = useTournamentStore();
  const showConfirmation = useAlertConfirmationStore(
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
    setIsEditing(true);
  };

  const handleSave = () => {
    showConfirmation({
      text: "Guardar cambios de la ronda",
      description:
        "Estas seguro de que deseas guardar los cambios realizados en esta ronda?",
      action: async () => {
        try {
          showLoading("Guardando resultados de la ronda...");

          await editRoundResults(round.roundNumber, editableMatches);

          setIsEditing(false);

          showToast("Ronda editada correctamente.", "success");

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
      maxVisibleMatches={4}
      headerActions={
        <>
          {canEditRound && !isEditing && (
            <button
              onClick={handleEdit}
              title="Editar ronda"
              className="p-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              <IoPencil />
            </button>
          )}

          {isEditing && (
            <>
              <button
                onClick={handleSave}
                title="Guardar cambios"
                className="p-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
              >
                <IoSave />
              </button>

              <button
                onClick={handleCancel}
                title="Cancelar edicion"
                className="p-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
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
