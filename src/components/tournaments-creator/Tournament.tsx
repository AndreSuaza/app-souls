"use client";

import { useState, useEffect } from "react";
import { useAlertConfirmationStore, useTournamentStore } from "@/store";
import { ConfirmationModal } from "@/components";
import { PlayerList } from "../tournaments/tournament/players/PlayerList";
import { SwissRoundManager } from "./SwissRoundManager";
import { SwissHistoric } from "./SwissHistoric";
import { StandingsTable } from "./StandingsTable";

type TournamentProps = {
  tournamentId: string;
};

export const Tournament = ({ tournamentId }: TournamentProps) => {
  const isAlertConfirmation = useAlertConfirmationStore(
    (state) => state.isAlertConfirmation
  );

  const { setTournamentId, fetchTournament, players } = useTournamentStore();

  const [editingRoundNumber, setEditingRoundNumber] = useState<number | null>(
    null
  );

  // hidratar desde DB
  useEffect(() => {
    setTournamentId(tournamentId);
    fetchTournament(tournamentId);
  }, [tournamentId, setTournamentId, fetchTournament]);

  const clearEditRound = () => setEditingRoundNumber(null);

  const handleEditRound = (roundNumber: number) => {
    setEditingRoundNumber(roundNumber);
  };

  return (
    <div className="mb-4">
      <div className="mx-auto px-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 min-h-80">
        <PlayerList />

        <SwissRoundManager />

        <SwissHistoric
          onEditRound={handleEditRound}
          editingRoundNumber={editingRoundNumber}
          onCancelEdit={clearEditRound}
        />

        <StandingsTable players={players} />
      </div>

      {isAlertConfirmation && <ConfirmationModal />}
    </div>
  );
};
