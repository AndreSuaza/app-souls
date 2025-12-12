"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";
import {
  IoChevronDownSharp,
  IoChevronUp,
  IoSave,
  IoClose,
  IoPencil,
} from "react-icons/io5";
import { useTournamentStore, useToastStore } from "@/store";
import { RoundInterface } from "@/interfaces";
import { PairingLabel } from "./PairingLabel";
import { PairingButtons } from "./PairingButtons";

type Props = {
  onEditRound: (roundNumber: number) => void;
  onCancelEdit: () => void;
  editingRoundNumber: number | null;
};

export const SwissHistoric = ({
  onEditRound,
  onCancelEdit,
  editingRoundNumber,
}: Props) => {
  const { rounds, tournament, editRoundResults } = useTournamentStore();
  const showToast = useToastStore((state) => state.showToast);
  const [editableRound, setEditableRound] = useState<RoundInterface | null>(
    null
  );

  useEffect(() => {
    if (editingRoundNumber === null) {
      setEditableRound(null);
      return;
    }

    const round = rounds.find((r) => r.roundNumber === editingRoundNumber);

    if (round) {
      setEditableRound(structuredClone(round));
    }
  }, [editingRoundNumber, rounds]);

  const [showHistory, setShowHistory] = useState(true);

  const showHistoryButton = () => {
    setShowHistory(!showHistory);
  };

  // Permiso de edición
  const canEditRound = (roundNumber: number) => {
    if (!tournament) return false;

    return (
      tournament.status === "in_progress" &&
      tournament.currentRoundNumber + 1 > roundNumber
    );
  };

  const handleSave = () => {
    if (!editableRound) return;

    try {
      editRoundResults(editableRound.roundNumber, editableRound.matches);
      showToast("Ronda editada correctamente.", "success");
      onCancelEdit();
    } catch {
      showToast("Error al guardar los cambios de la ronda.", "error");
    }
  };

  const handleCancel = () => {
    setEditableRound(null);
    onCancelEdit();
  };

  const setResultForEditableRound = (
    matchId: string,
    result: "P1" | "P2" | "DRAW"
  ) => {
    if (!editableRound) return;

    setEditableRound({
      ...editableRound,
      matches: editableRound.matches.map((m) =>
        m.id === matchId ? { ...m, result } : m
      ),
    });
  };

  return (
    <div
      className={clsx(
        "py-2 px-4 border rounded-md bg-slate-50 border-gray-300 transition-all overflow-hidden",
        showHistory ? "" : "h-[50px]"
      )}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-center uppercase text-xl font-bold text-gray-500">
          Historial
        </h2>

        {showHistory ? (
          <IoChevronUp
            className="p-1 w-8 h-8 rounded-md border"
            onClick={showHistoryButton}
          />
        ) : (
          <IoChevronDownSharp
            className="p-1 w-8 h-8 rounded-md border"
            onClick={showHistoryButton}
          />
        )}
      </div>

      {rounds
        .slice()
        .reverse()
        .map((round) => {
          const isEditingThisRound = editingRoundNumber === round.roundNumber;

          return (
            <div key={round.roundNumber}>
              <div className="flex justify-between items-center my-2">
                <h3 className="font-semibold uppercase text-gray-900">
                  Ronda {round.roundNumber}
                </h3>

                <div className="flex gap-2">
                  {editingRoundNumber === round.roundNumber && (
                    <>
                      <button
                        onClick={handleSave}
                        title="Guardar cambios"
                        className="p-1 rounded bg-green-600 hover:bg-green-700 text-white transition-colors"
                      >
                        <IoSave className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleCancel}
                        title="Cancelar edición"
                        className="p-1 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
                      >
                        <IoClose className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {editingRoundNumber !== round.roundNumber &&
                    canEditRound(round.roundNumber) && (
                      <button
                        onClick={() => onEditRound(round.roundNumber)}
                        title="Editar ronda"
                        className="p-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        <IoPencil className="w-4 h-4" />
                      </button>
                    )}
                </div>
              </div>

              <ul>
                {(isEditingThisRound
                  ? editableRound?.matches
                  : round.matches
                )?.map((match, idx) => (
                  <li
                    key={match.id}
                    className="grid grid-cols-5 gap-2 text-center p-1 border rounded mb-2"
                  >
                    {isEditingThisRound &&
                    match.player2Nickname !== null &&
                    match.player2Nickname !== "BYE" ? (
                      <PairingButtons
                        index={idx}
                        match={{
                          id: match.id,
                          player1Nickname: match.player1Nickname,
                          player2Nickname: match.player2Nickname,
                          result: match.result,
                        }}
                        setResultRount={setResultForEditableRound}
                      />
                    ) : (
                      <PairingLabel
                        match={{
                          id: match.id,
                          player1Nickname: match.player1Nickname,
                          player2Nickname: match.player2Nickname,
                          result: match.result,
                        }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
    </div>
  );
};
