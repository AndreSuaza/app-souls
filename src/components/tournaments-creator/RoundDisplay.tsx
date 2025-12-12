"use client";

import { PairingButtons } from "./PairingButtons";
import { RoundInterface } from "@/interfaces";

type Props = {
  currentRound: RoundInterface | undefined;
  setResultRount: (
    matchId: string,
    result: "P1" | "P2" | "DRAW",
    player2Nickname: string | null
  ) => void;
};

export const RoundDisplay = ({ currentRound, setResultRount }: Props) => {
  if (!currentRound) {
    return (
      <div className="p-4 border rounded bg-slate-50 text-center">
        Aún no se ha generado ninguna ronda.
      </div>
    );
  }

  return (
    <div className="py-2 px-4 border rounded-md bg-slate-50 border-gray-300">
      <h3 className="text-lg font-semibold uppercase text-gray-700 mb-2">
        Ronda {currentRound.roundNumber}
      </h3>

      <ul>
        {currentRound.matches.map((match, idx) => (
          <li
            key={match.id}
            className="grid grid-cols-6 gap-2 text-center p-1 border rounded mb-2"
          >
            <PairingButtons
              index={idx}
              match={match}
              setResultRount={setResultRount}
              disabled={!currentRound}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
