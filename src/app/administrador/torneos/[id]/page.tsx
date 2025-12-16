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

  // Si no hay mínimo de jugadores, forzar vista jugadores
  useEffect(() => {
    if (players.length < 2) {
      setActiveTab("players");
    }
  }, [players.length]);

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
