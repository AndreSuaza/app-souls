"use client";

import { MatchInterface, TournamentPlayerInterface } from "@/interfaces";
import { MatchStatusIcon } from "../current-round/MatchStatusIcon";
import { MatchResultSelector } from "../current-round/MatchResultSelector";
import { PlayerCell } from "../players/PlayerCell";
import { ScoreBadge } from "./ScoreBadge";

interface Props {
  match: MatchInterface;
  tableNumber: number;
  players: TournamentPlayerInterface[];
}

export const RoundHistoryMatchRow = ({
  match,
  tableNumber,
  players,
}: Props) => {
  const player1 = players.find((p) => p.id === match.player1Id);
  const player2 = players.find((p) => p.id === match.player2Id);

  const p1Highlight =
    match.result === "P1"
      ? "blue"
      : match.result === "DRAW"
      ? "yellow"
      : undefined;

  const p2Highlight =
    match.result === "P2"
      ? "red"
      : match.result === "DRAW"
      ? "yellow"
      : undefined;

  if (!player1) return null;

  return (
    <div className="grid grid-cols-[72px_1fr_120px_1fr_72px] items-center px-8 py-2">
      {/* Mesa */}
      <div className="flex justify-start">
        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
          {tableNumber}
        </span>
      </div>

      {/* Jugador 1 */}
      <div className="flex justify-start">
        <PlayerCell player={player1} highlight={p1Highlight} />
      </div>

      {/* Resultado */}
      <div className="flex justify-center">
        <MatchResultSelector match={match} layout="row" readOnly />
      </div>

      {/* Jugador 2 */}
      <div className="flex justify-end">
        {player2 ? (
          <PlayerCell player={player2} reverse highlight={p2Highlight} />
        ) : (
          <div className="flex items-center gap-3 justify-end text-right">
            <p className="font-semibold text-gray-400">BYE</p>
            <img
              src="/profile/player.webp"
              alt="BYE"
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
            />
          </div>
        )}
      </div>

      {/* Estado */}
      <div className="flex justify-end">
        <MatchStatusIcon resolved={match.result !== null} />
      </div>
    </div>
  );
};
