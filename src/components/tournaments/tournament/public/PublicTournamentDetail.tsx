"use client";

import { useCallback, useEffect, useState } from "react";
import { TournamentTabs, type TournamentTab } from "@/components";
import { getPublicTournamentDetailAction } from "@/actions";
import { type PublicTournamentDetail } from "@/interfaces";
import { useToastStore, useUIStore } from "@/store";
import { PublicTournamentPlayersView } from "./PublicTournamentPlayersView";
import { PublicTournamentCurrentRound } from "./PublicTournamentCurrentRound";
import { PublicTournamentRoundsHistory } from "./PublicTournamentRoundsHistory";

type Props = {
  initialTournament: PublicTournamentDetail;
};

export function PublicTournamentDetail({ initialTournament }: Props) {
  const [tournamentData, setTournamentData] =
    useState<PublicTournamentDetail>(initialTournament);
  const [activeTab, setActiveTab] = useState<TournamentTab>(() => {
    if (initialTournament.tournament.status === "finished") {
      return "players";
    }

    if (initialTournament.players.length < 4) {
      return "players";
    }

    return "currentRound";
  });
  const showLoading = useUIStore((s) => s.showLoading);
  const hideLoading = useUIStore((s) => s.hideLoading);
  const showToast = useToastStore((s) => s.showToast);

  const { tournament, players, rounds } = tournamentData;

  useEffect(() => {
    hideLoading();
  }, [hideLoading]);

  useEffect(() => {
    // Ajusta la pestana activa segun el estado y el minimo de jugadores.
    if (tournament.status === "finished") {
      if (activeTab === "currentRound") {
        setActiveTab("players");
      }
      return;
    }

    if (players.length < 4) {
      if (activeTab !== "players" && activeTab !== "information") {
        setActiveTab("players");
      }
    }
  }, [tournament.status, players.length, activeTab]);

  const handleReload = useCallback(async () => {
    showLoading("Actualizando torneo...");

    try {
      const refreshed = await getPublicTournamentDetailAction({
        tournamentId: tournament.id,
      });

      if (!refreshed) {
        showToast("Torneo no encontrado.", "error");
        return;
      }

      setTournamentData(refreshed);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el torneo",
        "error"
      );
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading, showToast, tournament.id]);

  return (
    <div className="space-y-6 px-4 pt-4 pb-16 md:pt-0 md:px-6 md:pb-20 lg:px-14">
      <TournamentTabs
        active={activeTab}
        onChange={setActiveTab}
        tournamentTitle={tournament.title}
        playersCount={players.length}
        tournamentStatus={tournament.status}
        hiddenTabs={["information"]}
      />

      {activeTab === "players" && (
        <PublicTournamentPlayersView
          players={players}
          rounds={rounds}
          status={tournament.status}
        />
      )}

      {activeTab === "currentRound" && (
        <PublicTournamentCurrentRound
          tournament={tournament}
          players={players}
          rounds={rounds}
          onReload={handleReload}
        />
      )}

      {activeTab === "rounds" && (
        <PublicTournamentRoundsHistory
          tournament={tournament}
          players={players}
          rounds={rounds}
        />
      )}
    </div>
  );
}
