"use client";

import { useState } from "react";
import { IoChevronDownSharp, IoChevronUp } from "react-icons/io5";
import clsx from "clsx";
import {
  useAlertConfirmationStore,
  useTournamentStore,
  useToastStore,
} from "@/store";
import { UserSummaryInterface } from "@/interfaces";
import { InitialPointsModal } from "../../../tournaments-creator/InitialPointsModal";
import { PlayerSearchInput } from "./PlayerSearchInput";
import { PlayerListView } from "./PlayerListView";

export const PlayerList = () => {
  const showToast = useToastStore((state) => state.showToast);

  const { players, tournament, addPlayerByUserId, deletePlayer } =
    useTournamentStore();
  const openAlertConfirmation = useAlertConfirmationStore(
    (s) => s.openAlertConfirmation
  );
  const isFinished = tournament?.status === "finished";

  const [showPlayers, setShowPlayers] = useState(true);
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [selectedUserForInitialPoints, setSelectedUserForInitialPoints] =
    useState<UserSummaryInterface | null>(null);

  // Cuando se selecciona un usuario desde PlayerSearchInput
  const handleSelect = async (user: UserSummaryInterface) => {
    if (tournament?.currentRoundNumber && tournament?.currentRoundNumber > 0) {
      setSelectedUserForInitialPoints(user);
      setShowInitialModal(true);
      return;
    }

    try {
      await addPlayerByUserId(
        user.id,
        user.nickname,
        user.name,
        user.lastname,
        user.image,
        0
      );
      showToast("Jugador agregado al torneo", "success");
    } catch {
      showToast("Error al agregar el jugador", "error");
    }
  };

  const confirmInitialRoundsWon = async (roundsWon: number) => {
    if (!selectedUserForInitialPoints || !tournament) return;

    const maxRounds = tournament.currentRoundNumber + 1;
    const safeRoundsWon = Math.min(roundsWon, maxRounds);

    const points = safeRoundsWon * 3;

    try {
      await addPlayerByUserId(
        selectedUserForInitialPoints.id,
        selectedUserForInitialPoints.nickname,
        selectedUserForInitialPoints.name,
        selectedUserForInitialPoints.lastname,
        selectedUserForInitialPoints.image,
        points
      );

      setShowInitialModal(false);
      setSelectedUserForInitialPoints(null);

      showToast("Jugador agregado al torneo", "success");
    } catch {
      showToast("Error al agregar el jugador", "error");
    }
  };

  const cancelInitialPoints = () => {
    setShowInitialModal(false);
    setSelectedUserForInitialPoints(null);
  };

  return (
    <div className="px-4 py-3 border rounded-md bg-slate-50 border-gray-300 transition-all flex-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-center text-xl font-bold">Jugadores</h2>

        <div className="lg:hidden">
          {showPlayers ? (
            <IoChevronUp
              className="p-1 w-8 h-8 rounded-md border cursor-pointer"
              onClick={() => setShowPlayers(false)}
            />
          ) : (
            <IoChevronDownSharp
              className="p-1 w-8 h-8 rounded-md border cursor-pointer"
              onClick={() => setShowPlayers(true)}
            />
          )}
        </div>
      </div>

      {/* Buscador */}
      {showPlayers && (
        <PlayerSearchInput
          existingPlayersIds={players.map((p) => p.userId)}
          onSelectUser={handleSelect}
        />
      )}

      {/* Lista scrolleable */}
      <div
        className={clsx(
          "transition-all duration-300",
          showPlayers
            ? "max-h-[530px] overflow-y-auto opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        )}
      >
        <PlayerListView
          players={players}
          isFinished={isFinished}
          onDelete={(id) => {
            openAlertConfirmation({
              text: "¿Deseas eliminar este jugador del torneo?",
              action: async () => {
                return await deletePlayer(id);
              },
              onSuccess: () => {
                showToast("Jugador eliminado del torneo", "warning");
              },
              onError: () => {
                showToast("No se pudo eliminar el jugador", "error");
              },
            });
          }}
        />
      </div>

      {showInitialModal && selectedUserForInitialPoints && (
        <InitialPointsModal
          user={selectedUserForInitialPoints}
          maxRounds={
            tournament?.currentRoundNumber
              ? tournament?.currentRoundNumber + 1
              : 0
          }
          onConfirm={confirmInitialRoundsWon}
          onCancel={cancelInitialPoints}
        />
      )}
    </div>
  );
};
