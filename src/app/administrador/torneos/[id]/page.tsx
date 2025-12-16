"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTournamentStore } from "@/store";
import {
  TournamentTabs,
  TournamentPlayersView,
  TournamentCurrentRound,
  TournamentRoundsHistory,
} from "@/components";

export type TournamentTab = "players" | "currentRound" | "rounds";

export default function TournamentAdminPage() {
  const { id } = useParams<{ id: string }>();
  const { tournament, fetchTournament, players } = useTournamentStore();

  const [activeTab, setActiveTab] = useState<TournamentTab>("currentRound");

  useEffect(() => {
    fetchTournament(id);
  }, [id, fetchTournament]);

  // Validación de pestaña activa según estado del torneo y jugadores
  useEffect(() => {
    // Esperar a que el torneo esté cargado
    if (!tournament) return;

    // Si el torneo ya finalizó, forzar vista de jugadores
    if (tournament.status === "finished") {
      if (activeTab !== "players") setActiveTab("players");
      return;
    }

    // Si no hay mínimo de jugadores, solo forzar si NO estás ya en players
    if (players.length < 3) {
      if (activeTab !== "players") setActiveTab("players");
      return;
    }
  }, [tournament, players.length, activeTab]);

  return (
    <div className="space-y-6">
      <TournamentTabs
        active={activeTab}
        onChange={setActiveTab}
        tournamentTitle={tournament?.title ?? "Torneo"}
      />

      {activeTab === "players" && <TournamentPlayersView />}

      {activeTab === "currentRound" && <TournamentCurrentRound />}

      {activeTab === "rounds" && <TournamentRoundsHistory />}
    </div>
  );
}
