"use client";

import { useState, useEffect } from "react";
import {
  IoChevronDown,
  IoChevronUp,
  IoPencil,
  IoSave,
  IoClose,
} from "react-icons/io5";
import { RoundInterface, TournamentPlayerInterface } from "@/interfaces";
import {
  BasicTournament,
  useTournamentStore,
  useAlertConfirmationStore,
  useUIStore,
  useToastStore,
} from "@/store";
import { RoundStatusBadge } from "./RoundStatusBadge";
import { MatchCard } from "../current-round/MarchCard";

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

  const [showAll, setShowAll] = useState(false);

  // Estado de la ronda calculado inline
  const lastRoundNumber =
    tournament.status === "finished"
      ? tournament.currentRoundNumber
      : tournament.currentRoundNumber + 1;

  const isLastRound = round.roundNumber === lastRoundNumber;

  const [expanded, setExpanded] = useState<boolean>(isLastRound);
  // Controla si esta ronda está en modo edición
  const [isEditing, setIsEditing] = useState(false);

  // Copia local editable de los matchs (NO se guarda hasta confirmar)
  const [editableMatches, setEditableMatches] = useState(round.matches);

  useEffect(() => {
    if (isLastRound) {
      setExpanded(true); // la última ronda siempre expandida
    }
  }, [isLastRound]);

  const status =
    tournament.status === "in_progress" && isLastRound
      ? "IN_PROGRESS"
      : "FINISHED";

  const totalMatches = round.matches.length;
  const completedMatches = round.matches.filter(
    (m) => m.result !== null
  ).length;

  const visibleMatches = showAll ? round.matches : round.matches.slice(0, 4);

  // Determina si la ronda puede editarse
  const canEditRound =
    tournament.status === "in_progress" &&
    round.roundNumber < tournament.currentRoundNumber + 1;

  const handleEdit = () => {
    // Si es la ronda actual → ir a pestaña Ronda actual
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
        "¿Estás seguro de que deseas guardar los cambios realizados en esta ronda?",
      action: async () => {
        try {
          showLoading("Guardando resultados de la ronda...");

          await editRoundResults(round.roundNumber, editableMatches);

          setIsEditing(false);

          showToast("Ronda editada correctamente.", "success");

          return true;
        } catch (error) {
          showToast(
            "Ocurrió un error al guardar los cambios de la ronda.",
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
      prev.map((m) => (m.id === matchId ? { ...m, result } : m))
    );
  };

  return (
    <div className="border rounded-xl bg-white shadow-sm py-3">
      {/* Header */}
      <div className="flex justify-between items-center px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">
              Ronda {round.roundNumber}
            </h3>

            <RoundStatusBadge status={status} />

            {/* Botones edición */}
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
                  title="Cancelar edición"
                  className="p-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                >
                  <IoClose />
                </button>
              </>
            )}
          </div>

          <p className="text-sm text-gray-500">
            {status === "IN_PROGRESS"
              ? `${completedMatches} de ${totalMatches} partidas completadas`
              : `${totalMatches} partidas completadas`}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-md border"
        >
          {expanded ? <IoChevronUp /> : <IoChevronDown />}
        </button>
      </div>

      {/* Detalle */}
      {expanded && (
        <>
          <hr className="mt-3 border-gray-200" />

          {/* Encabezado de columnas */}
          <div className="grid grid-cols-[72px_1fr_120px_1fr_72px] items-center bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-500">
            <div className="text-left">Mesa</div>
            <div className="text-left">
              <span className="sm:hidden">P1</span>
              <span className="hidden sm:inline">Jugador 1</span>
            </div>
            <div className="text-center">Resultado</div>
            <div className="text-right">
              <span className="sm:hidden">P2</span>
              <span className="hidden sm:inline">Jugador 2</span>
            </div>
            <div className="text-right">Estado</div>
          </div>

          <div>
            {(isEditing ? editableMatches : visibleMatches).map(
              (match, index) => (
                <div key={match.id}>
                  <MatchCard
                    key={match.id}
                    match={match}
                    tableNumber={index + 1}
                    players={players}
                    readOnly={!isEditing}
                    decorated={false}
                    onChangeResult={
                      isEditing ? handleLocalResultChange : undefined
                    }
                  />

                  <hr className=" border-gray-200" />
                </div>
              )
            )}

            {round.matches.length > 4 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAll((prev) => !prev)}
                  className="text-sm font-medium text-indigo-600 hover:underline"
                >
                  {showAll
                    ? "Mostrar menos"
                    : `Ver las ${round.matches.length} partidas`}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
