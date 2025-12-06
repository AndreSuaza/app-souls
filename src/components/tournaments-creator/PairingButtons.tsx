"use client";

import clsx from "clsx";
import { IoTrophySharp } from "react-icons/io5";

type MatchUI = {
  id: string;
  player1Nickname: string;
  player2Nickname: string | null;
  result: "P1" | "P2" | "DRAW" | null;
};

type Props = {
  match: MatchUI;
  index: number;
  setResultRount: (matchId: string, result: "P1" | "P2" | "DRAW") => void;
  disabled?: boolean;
};

export const PairingButtons = ({
  match,
  index,
  setResultRount,
  disabled,
}: Props) => {
  return (
    <>
      <button
        onClick={() => !disabled && setResultRount(match.id, "P1")}
        disabled={disabled}
        className={clsx(
          "text-center capitalize col-span-2 bg-blue-100 text-black hover:bg-blue-500 transition-all relative",
          {
            "bg-blue-500 text-white": match.result === "P1",
            "bg-yellow-100": match.result === "DRAW",
          }
        )}
      >
        {match.result === "P1" && (
          <span className="absolute -left-2 -top-2 bg-gray-600 rounded-full">
            <IoTrophySharp className="w-5 h-5 text-yellow-400 p-1" />
          </span>
        )}
        {match.player1Nickname}
      </button>

      <div className="text-xl uppercase font-extrabold mx-2 text-gray-500">
        vs
      </div>

      <button
        onClick={() => !disabled && setResultRount(match.id, "P2")}
        disabled={disabled}
        className={clsx(
          "text-center capitalize col-span-2 bg-red-100 text-black hover:bg-red-500 transition-all relative",
          {
            "bg-red-500 text-white": match.result === "P2",
            "bg-yellow-100": match.result === "DRAW",
          }
        )}
      >
        {match.result === "P2" && (
          <span className="absolute -left-2 -top-2 bg-gray-600 rounded-full">
            <IoTrophySharp className="w-5 h-5 text-yellow-400 p-1" />
          </span>
        )}
        {match.player2Nickname}
      </button>

      <button
        onClick={() => !disabled && setResultRount(match.id, "DRAW")}
        disabled={disabled}
        title="Partida Empatad"
        className={"text-center bg-indigo-500 text-white rounded"}
      >
        PE
      </button>
    </>
  );
};
