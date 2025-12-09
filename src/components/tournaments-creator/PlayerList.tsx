"use client";

import { useState } from "react";
import { IoChevronDownSharp, IoChevronUp } from "react-icons/io5";
import clsx from "clsx";
import { useAlertConfirmationStore, useTournamentStore } from "@/store";
import { InitialPointsModal } from "./InitialPointsModal";
import { PlayerSearchInput } from "./PlayerSearchInput";
import { PlayerListView } from "./PlayerListView";

export const PlayerList = () => {
  const { players, rounds, tournament, addPlayerByUserId, deletePlayer } =
    useTournamentStore();

  const currentRound = rounds.length; // número real de ronda actual
  const isFinished = tournament?.status === "finished";

  const [showPlayers, setShowPlayers] = useState(true);
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [selectedUserForInitialPoints, setSelectedUserForInitialPoints] =
    useState<any>(null);

  const openAlert = useAlertConfirmationStore((s) => s.openAlertConfirmation);
  const setAction = useAlertConfirmationStore((s) => s.setAction);

  // Cuando se selecciona un usuario desde PlayerSearchInput
  const handleSelect = async (user: any) => {
    if (currentRound > 0) {
      setSelectedUserForInitialPoints(user);
      setShowInitialModal(true);
      return;
    }

    await addPlayerByUserId(user.id, user.nickname, 0);
  };

  const confirmInitialPoints = async (points: number) => {
    if (!selectedUserForInitialPoints) return;

    await addPlayerByUserId(
      selectedUserForInitialPoints.id,
      selectedUserForInitialPoints.nickname,
      points
    );

    setShowInitialModal(false);
    setSelectedUserForInitialPoints(null);
  };

  const cancelInitialPoints = () => {
    setShowInitialModal(false);
    setSelectedUserForInitialPoints(null);
  };

  return (
    <div className="px-4 py-3 border rounded-md bg-slate-50 border-gray-300 overflow-hidden transition-all">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-center uppercase text-xl font-bold">Jugadores</h2>

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

      {/* Input con autocompletado */}
      <div
        className={clsx(
          "transition-all duration-300",
          showPlayers ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {/* Input con autocompletado */}
        <PlayerSearchInput
          existingPlayersIds={players.map((p) => p.userId)}
          onSelectUser={handleSelect}
        />

        {/* Lista de jugadores en el torneo */}
        <PlayerListView
          players={players}
          isFinished={isFinished}
          onDelete={(id) => {
            setAction(() => () => deletePlayer(id));
            openAlert();
          }}
        />
      </div>

      {showInitialModal && (
        <InitialPointsModal
          user={selectedUserForInitialPoints}
          onConfirm={confirmInitialPoints}
          onCancel={cancelInitialPoints}
        />
      )}
    </div>
  );
};
