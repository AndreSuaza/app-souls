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

export const RankingDesktopTable = ({
  players,
  currentPage,
  pageSize,
}: Props) => {
  const rounds = useTournamentStore((s) => s.rounds);

  return (
    <div className="hidden md:block">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-sm text-gray-500 border-b">
            <th className="py-2 text-left w-12">#</th>
            <th className="py-2 text-left">Jugador</th>
            <th className="py-2 text-center">Puntos</th>
            <th className="py-2 text-center">Buchholz</th>
            <th className="py-2 text-center">Record</th>
          </tr>
        </thead>

        <tbody>
          {players.map((player, index) => {
            const rank = (currentPage - 1) * pageSize + index + 1;

            return (
              <tr key={player.id} className="border-b last:border-none">
                <td className="py-3">
                  <RankBadge rank={rank} />
                </td>

                <td className="py-3">
                  <PlayerCell player={player} />
                </td>

                <td className="py-3 text-center font-bold">{player.points}</td>

                <td className="py-3 text-center">{player.buchholz}</td>

                <td className="py-3 text-center">
                  {formatRecord(calculatePlayerRecord(player.id, rounds))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
