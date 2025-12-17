"use client";

import { TournamentPlayerInterface } from "@/interfaces";
import { RankBadge } from "./RankBadge";
import { PlayerCell } from "./PlayerCell";
import { calculatePlayerRecord, formatRecord } from "@/utils/ranking";
import { useTournamentStore } from "@/store";

interface Props {
  players: TournamentPlayerInterface[];
  currentPage: number;
  pageSize: number;
}

export const RankingMobileList = ({
  players,
  currentPage,
  pageSize,
}: Props) => {
  const rounds = useTournamentStore((s) => s.rounds);

  return (
    <div className="md:hidden space-y-3">
      {players.map((player, index) => {
        const rank = (currentPage - 1) * pageSize + index + 1;

        return (
          <div
            key={player.id}
            className="border rounded-md p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <RankBadge rank={rank} />
              <PlayerCell player={player} />
            </div>

            <div className="text-right text-sm">
              <p className="font-bold">{player.points} pts</p>
              <p className="text-gray-500">DE {player.buchholz}</p>
              <p>{formatRecord(calculatePlayerRecord(player.id, rounds))}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
