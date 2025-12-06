"use client";

import clsx from "clsx";
import { IoTrophySharp } from "react-icons/io5";
// import { Pair } from "./swiss";

// type Props = {
//   pair: Pair;
// };

type MatchUI = {
  id: string;
  player1Nickname: string;
  player2Nickname: string | null;
  result: "P1" | "P2" | "DRAW" | null;
};

type Props = {
  match: MatchUI;
};

export const PairingLabel = ({ match }: Props) => {
  return (
    <>
      {/* PLAYER 1 LABEL */}
      <div
        className={clsx("text-center capitalize col-span-2 relative", {
          "bg-blue-100 text-white": match.result === "P1",
          "bg-yellow-100": match.result === "DRAW",
        })}
      >
        {match.result === "P1" && (
          <span className="absolute -left-2 -top-2 bg-gray-600 rounded-full opacity-70">
            <IoTrophySharp className="w-5 h-5 text-yellow-400 p-1" />
          </span>
        )}
        {match.player1Nickname}
      </div>

      {/* VS */}
      <div className="text-xl uppercase font-extrabold mx-2 text-gray-500">
        vs
      </div>

      {/* PLAYER 2 LABEL */}
      <div
        className={clsx("text-center capitalize col-span-2 relative", {
          "bg-red-100 text-white": match.result === "P2",
          "bg-yellow-100": match.result === "DRAW",
        })}
      >
        {match.result === "P2" && (
          <span className="absolute -left-2 -top-2 bg-gray-600 rounded-full opacity-70">
            <IoTrophySharp className="w-5 h-5 text-yellow-400 p-1" />
          </span>
        )}
        {match.player2Nickname ?? "BYE"}
      </div>
    </>
  );
};
