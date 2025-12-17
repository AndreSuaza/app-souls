"use client";

import { useState } from "react";
import { RoundInterface, TournamentPlayerInterface } from "@/interfaces";
import { RoundStatusBadge } from "./RoundStatusBadge";
import { RoundHistoryMatchRow } from "./RoundHistoryMatchRow";
import { BasicTournament } from "@/store";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

interface Props {
  round: RoundInterface;
  tournament: BasicTournament;
  players: TournamentPlayerInterface[];
}

export const RoundHistoryCard = ({ round, tournament, players }: Props) => {
  const [showAll, setShowAll] = useState(false);

  // Estado de la ronda calculado inline (simplificado)
  const isCurrentRound =
    round.roundNumber === tournament.currentRoundNumber + 1 &&
    tournament.status === "in_progress";

  const [expanded, setExpanded] = useState<boolean>(isCurrentRound);

  const status = isCurrentRound ? "IN_PROGRESS" : "FINISHED";

  const totalMatches = round.matches.length;
  const completedMatches = round.matches.filter(
    (m) => m.result !== null
  ).length;

  const visibleMatches = showAll ? round.matches : round.matches.slice(0, 4);

  return (
    <div className="border rounded-xl bg-white shadow-sm py-3">
      {/* Header */}
      <div className="flex justify-between items-center px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">
              Ronda {round.roundNumber}
            </h3>
            <RoundStatusBadge status={status} />
          </div>

          <p className="text-sm text-gray-500">
            {status === "IN_PROGRESS"
              ? `${completedMatches} de ${totalMatches} partidas completadas`
              : `${totalMatches} partidas completadas`}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-md border"
        >
          {expanded ? <IoChevronUp /> : <IoChevronDown />}
        </button>
      </div>

      {/* Detalle */}
      {expanded && (
        <>
          <hr className="mt-3 border-gray-200" />

          {/* Encabezado de columnas */}
          <div className="grid grid-cols-[72px_1fr_120px_1fr_72px] items-center bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-500">
            <div className="text-left">Mesa</div>
            <div className="text-left">Jugador 1</div>
            <div className="text-center">Resultado</div>
            <div className="text-right">Jugador 2</div>
            <div className="text-right">Estado</div>
          </div>

          <div>
            {visibleMatches.map((match, index) => (
              <>
                <RoundHistoryMatchRow
                  key={match.id}
                  match={match}
                  tableNumber={index + 1}
                  players={players}
                />

                <hr className=" border-gray-200" />
              </>
            ))}

            {round.matches.length > 4 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAll((prev) => !prev)}
                  className="text-sm font-medium text-indigo-600 hover:underline"
                >
                  {showAll
                    ? "Mostrar menos"
                    : `Ver las ${round.matches.length} partidas`}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
