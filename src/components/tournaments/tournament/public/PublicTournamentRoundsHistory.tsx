"use client";

import { useMemo } from "react";
import { FaCheckCircle, FaClock } from "react-icons/fa";
import { RoundHistoryCardBase } from "../hisotry/RoundHistoryCardBase";
import { ResultButton } from "../current-round/ResultButton";
import {
  type MatchInterface,
  type PublicTournamentDetail,
  type RoundInterface,
  type TournamentPlayerInterface,
} from "@/interfaces";

type Props = {
  tournament: PublicTournamentDetail["tournament"];
  players: TournamentPlayerInterface[];
  rounds: RoundInterface[];
};

export function PublicTournamentRoundsHistory({
  tournament,
  players,
  rounds,
}: Props) {
  if (rounds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 bg-white border rounded-xl p-4 sm:p-8 text-center text-gray-500">
        <p className="text-lg font-semibold">Aun no hay rondas generadas</p>
        <p className="text-sm">
          Cuando se genere la primera ronda, aqui podras ver el historial de
          emparejamientos y resultados.
        </p>
      </div>
    );
  }

  const orderedRounds = useMemo(() => {
    // Ordena la ronda actual primero y luego el resto en descendente.
    return [...rounds].sort((a, b) => {
      if (a.roundNumber === tournament.currentRoundNumber + 1) return -1;
      if (b.roundNumber === tournament.currentRoundNumber + 1) return 1;
      return b.roundNumber - a.roundNumber;
    });
  }, [rounds, tournament.currentRoundNumber]);

  const renderResultButtons = (match: MatchInterface) => (
    <div className="grid grid-cols-3 gap-2 w-full md:flex md:items-center md:justify-center">
      <div className="flex justify-end">
        <ResultButton
          label="Victoria"
          variant="p1"
          active={match.result === "P1"}
          readOnly
          onClick={() => {}}
        />
      </div>

      <div className="flex justify-center">
        <ResultButton
          label="Empate"
          variant="draw"
          active={match.result === "DRAW"}
          readOnly
          onClick={() => {}}
        />
      </div>

      <div className="flex justify-start">
        <ResultButton
          label="Victoria"
          variant="p2"
          active={match.result === "P2"}
          readOnly
          onClick={() => {}}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {orderedRounds.map((round, index) => {
        const isCurrentRound =
          round.roundNumber === tournament.currentRoundNumber + 1 &&
          tournament.status === "in_progress";

        const lastRoundNumber =
          tournament.status === "finished"
            ? tournament.currentRoundNumber
            : tournament.currentRoundNumber + 1;

        const isLastRound = round.roundNumber === lastRoundNumber;
        const status = isCurrentRound ? "IN_PROGRESS" : "FINISHED";

        return (
          <div key={round.id} className="flex gap-4">
            <div className="hidden sm:flex relative flex-col items-center">
              <div
                className={`w-8 h-8 bg-white rounded-full flex items-center justify-center border ${
                  isCurrentRound
                    ? "text-blue-600 border-blue-600"
                    : "text-green-600 border-gray-300"
                }`}
              >
                {isCurrentRound ? (
                  <FaClock size={14} />
                ) : (
                  <FaCheckCircle size={14} />
                )}
              </div>

              {index !== orderedRounds.length - 1 && (
                <div className="flex-1 w-px bg-gray-300 mt-1" />
              )}
            </div>

            <div className="flex-1">
              <RoundHistoryCardBase
                round={round}
                players={players}
                status={status}
                matches={round.matches}
                readOnly
                renderResult={renderResultButtons}
                defaultExpanded={isLastRound}
                allowExpand
                maxVisibleMatches={4}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
