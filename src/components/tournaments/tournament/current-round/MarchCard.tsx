"use client";

import { MatchInterface, TournamentPlayerInterface } from "@/interfaces";
import { PlayerCell } from "../players/PlayerCell";
import { MatchResultSelector } from "./MatchResultSelector";
import { MatchStatusIcon } from "./MatchStatusIcon";

export const MatchCard = ({
  match,
  tableNumber,
  players,
}: {
  match: MatchInterface;
  tableNumber: number;
  players: TournamentPlayerInterface[];
}) => {
  const player1 = players.find((p) => p.id === match.player1Id);
  const player2 = players.find((p) => p.id === match.player2Id);

  if (!player1) return null;

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

  return (
    <div className="grid grid-cols-[72px_1fr_220px_1fr_72px] items-center bg-white border rounded-xl p-4 shadow-sm">
      {/* Mesa (alineado a la izquierda con el header) */}
      <div className="flex justify-start">
        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 font-semibold">
          {tableNumber}
        </span>
      </div>

      {/* Jugador 1 */}
      <PlayerCell player={player1} highlight={p1Highlight} />

      {/* Resultado */}
      <MatchResultSelector match={match} />

      {/* Jugador 2 (nickname/nombre a la derecha + avatar a la derecha) */}
      <div className="flex justify-end">
        {player2 ? (
          <PlayerCell player={player2} reverse highlight={p2Highlight} />
        ) : (
          <div className="flex items-center gap-3 justify-end text-right">
            {/* Texto BYE */}
            <div className="leading-tight">
              <p className="font-semibold text-gray-400">BYE</p>
            </div>

            {/* Avatar por defecto */}
            <img
              src="/profile/player.webp"
              alt="BYE"
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
            />
          </div>
        )}
      </div>

      {/* Estado (alineado a la derecha con el header) */}
      <div className="flex justify-end">
        <MatchStatusIcon resolved={match.result !== null} />
      </div>
    </div>
  );
};
