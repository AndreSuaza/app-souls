"use client";

import { useEffect, useState } from "react";
import { getActiveTournament } from "@/actions";
import { useToastStore, useUIStore } from "@/store";
import { type ActiveTournamentData } from "@/interfaces";
import { ProfileCurrentTournament } from "./ProfileCurrentTournament";

type Props = {
  activeTournament: ActiveTournamentData | null;
  hasSession: boolean;
  isPlayer: boolean;
};

export const ProfileTournamentSection = ({
  activeTournament,
  hasSession,
  isPlayer,
}: Props) => {
  const [activeTournamentState, setActiveTournamentState] =
    useState<ActiveTournamentData | null>(activeTournament);
  const [hasShownInProgressWarning, setHasShownInProgressWarning] =
    useState(false);
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);

  useEffect(() => {
    setActiveTournamentState(activeTournament);
  }, [activeTournament]);

  const hasTournament = Boolean(
    activeTournamentState?.currentTournament ||
      activeTournamentState?.lastTournament,
  );

  if (!isPlayer || !hasTournament || !activeTournamentState) {
    return null;
  }

  const hasCurrentTournament = Boolean(activeTournamentState.currentTournament);
  const tournamentLabel = hasCurrentTournament
    ? "Torneo actual"
    : "Último torneo";

  const handleRefreshTournament = async () => {
    // Refresca el snapshot del torneo sin recargar toda la página.
    showLoading("Actualizando torneo...");
    try {
      const refreshed = await getActiveTournament();
      setActiveTournamentState(refreshed);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el torneo",
        "error",
      );
    } finally {
      hideLoading();
    }
  };

  return (
    <section className="w-full space-y-4">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-purple-200">
        {tournamentLabel}
      </h2>
      <ProfileCurrentTournament
        data={activeTournamentState}
        hasShownInProgressWarning={hasShownInProgressWarning}
        onInProgressWarningShown={() => setHasShownInProgressWarning(true)}
        onRefreshTournament={handleRefreshTournament}
        enableDeckAssociation={isPlayer}
        hasSession={hasSession}
      />
    </section>
  );
};
