"use client";

// import { Round } from "./swiss";
import clsx from "clsx";
import { useState } from "react";
import { IoChevronDownSharp, IoChevronUp } from "react-icons/io5";
import { PairingLabel } from "./PairingLabel";
import { useTournamentStore } from "@/store";

// type Props = {
//   rounds: Round[];
// };

export const SwissHistoric = () => {
  const { tournament } = useTournamentStore();
  const rounds = tournament?.tournamentRounds ?? [];

  const [showHistory, setShowHistory] = useState(true);

  const showHistoryButton = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div
      className={clsx(
        "py-2 px-4 border rounded-md bg-slate-50 border-gray-300 transition-all overflow-hidden",
        showHistory ? "" : "h-[50px]"
      )}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-center uppercase text-xl font-bold text-gray-500">
          Historial
        </h2>
        {showHistory ? (
          <IoChevronUp
            className="p-1 w-8 h-8 rounded-md border"
            onClick={showHistoryButton}
          />
        ) : (
          <IoChevronDownSharp
            className="p-1 w-8 h-8 rounded-md border"
            onClick={showHistoryButton}
          />
        )}
      </div>

      {rounds
        .slice()
        .reverse()
        .map((round) => (
          <div key={round.roundNumber}>
            <h3 className="font-semibold uppercase text-gray-900 my-2">
              Ronda {round.roundNumber}
            </h3>
            <ul>
              {round.matches.map((match) => (
                <li
                  key={match.player1Nickname}
                  className="grid grid-cols-5 gap-2 text-center p-1 border rounded mb-2"
                >
                  <PairingLabel match={match} />
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
};
