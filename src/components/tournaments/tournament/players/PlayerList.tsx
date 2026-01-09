"use client";

import { useRef, useState } from "react";
import { IoChevronDownSharp, IoChevronUp } from "react-icons/io5";
import clsx from "clsx";
import {
  useAlertConfirmationStore,
  useTournamentStore,
  useUIStore,
  useToastStore,
} from "@/store";
import { UserSummaryInterface } from "@/interfaces";
import { InitialPointsModal } from "./InitialPointsModal";
import { PlayerSearchInput } from "./PlayerSearchInput";
import { PlayerListView } from "./PlayerListView";

export const PlayerList = () => {
  const showToast = useToastStore((state) => state.showToast);

  const { players, rounds, tournament, addPlayerByUserId, deletePlayer } =
    useTournamentStore();
  const openAlertConfirmation = useAlertConfirmationStore(
    (s) => s.openAlertConfirmation
  );
  const showLoading = useUIStore((s) => s.showLoading);
  const hideLoading = useUIStore((s) => s.hideLoading);
  const isFinished = tournament?.status === "finished";

  const [showPlayers, setShowPlayers] = useState(true);
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [selectedUserForInitialPoints, setSelectedUserForInitialPoints] =
    useState<UserSummaryInterface | null>(null);
  const isSubmittingInitialPoints = useRef(false);

  // Cuando se selecciona un usuario desde PlayerSearchInput
  const handleSelect = async (user: UserSummaryInterface) => {
    const firstRoundStarted = !!rounds[0]?.startedAt;

    // Solo solicitar puntos iniciales cuando la primera ronda ya inicio.
    if (firstRoundStarted) {
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
    if (isSubmittingInitialPoints.current) return;
    if (!selectedUserForInitialPoints || !tournament) return;

    isSubmittingInitialPoints.current = true;
    const selectedUser = selectedUserForInitialPoints;

    const maxRounds = tournament.currentRoundNumber + 1;
    const safeRoundsWon = Math.min(roundsWon, maxRounds);

    const points = safeRoundsWon * 3;

    try {
      // Cierra el modal y evita duplicados mientras se procesa el registro.
      setShowInitialModal(false);
      setSelectedUserForInitialPoints(null);
      showLoading("Agregando jugador...");

      await addPlayerByUserId(
        selectedUser.id,
        selectedUser.nickname,
        selectedUser.name,
        selectedUser.lastname,
        selectedUser.image,
        points
      );

      showToast("Jugador agregado al torneo", "success");
    } catch {
      showToast("Error al agregar el jugador", "error");
    } finally {
      hideLoading();
      isSubmittingInitialPoints.current = false;
    }
  };

  const cancelInitialPoints = () => {
    setShowInitialModal(false);
    setSelectedUserForInitialPoints(null);
  };

  return (
    <div className="flex-1 rounded-xl border border-tournament-dark-accent bg-white p-4 shadow-sm transition-all dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-center text-xl font-bold text-slate-900 dark:text-white">
          Jugadores
        </h2>

        <div className="lg:hidden">
          {showPlayers ? (
            <IoChevronUp
              className="p-1 w-8 h-8 rounded-md border border-tournament-dark-accent text-slate-600 dark:border-tournament-dark-border dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-tournament-dark-muted cursor-pointer"
              onClick={() => setShowPlayers(false)}
            />
          ) : (
            <IoChevronDownSharp
              className="p-1 w-8 h-8 rounded-md border border-tournament-dark-accent text-slate-600 dark:border-tournament-dark-border dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-tournament-dark-muted cursor-pointer"
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
          maxRounds={rounds.length}
          onConfirm={confirmInitialRoundsWon}
          onCancel={cancelInitialPoints}
        />
      )}
    </div>
  );
};
