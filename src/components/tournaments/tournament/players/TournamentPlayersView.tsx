"use client";

import { PlayerList } from "./PlayerList";
import { TournamentRanking } from "./TournamentRanking";

export const TournamentPlayersView = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-5 gap-4 lg:min-h-[500px]">
      {/* JUGADORES */}
      <div className="lg:col-span-2  flex">
        <PlayerList />
      </div>

      {/* RANKING */}
      <div className="lg:col-span-3 flex">
        <TournamentRanking />
      </div>
    </div>
  );
};
