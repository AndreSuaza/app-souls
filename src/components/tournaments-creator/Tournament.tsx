"use client";

import { useEffect } from "react";
import { ConfirmationModal } from "@/components";
import { useAlertConfirmationStore, useTournamentStore } from "@/store";
import { PlayerList } from "./PlayerList";
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

  // hidratar desde DB
  useEffect(() => {
    setTournamentId(tournamentId);
    fetchTournament(tournamentId);
  }, [tournamentId, setTournamentId, fetchTournament]);

  return (
    <div className="mb-4">
      <div className="mx-auto px-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 min-h-80">
        <PlayerList />

        <SwissRoundManager />

        <SwissHistoric />

        <StandingsTable players={players} />
      </div>

      {isAlertConfirmation && (
        <ConfirmationModal
          text="¿Está seguro de eliminar a este jugador del torneo?"
          className="top-0 left-0 flex justify-center bg-gray-100 z-20 transition-all w-full md:w-1/3 md:left-1/3 md:h-1/5 md:top-1/3 rounded-md border-2 border-gray-400"
        />
      )}
    </div>
  );
};
