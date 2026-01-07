"use client";

import Image from "next/image";
import { TournamentPlayerInterface } from "@/interfaces";

type Highlight = "blue" | "red" | "yellow";

interface Props {
  player: TournamentPlayerInterface;
  reverse?: boolean; // Invierte layout (avatar a la derecha)
  highlight?: Highlight; // Color UI para nickname + borde avatar
}

export const PlayerCell = ({ player, reverse = false, highlight }: Props) => {
  const imageName = player.image ?? "player";

  const highlightText =
    highlight === "blue"
      ? "text-blue-600 dark:text-blue-300"
      : highlight === "red"
      ? "text-red-600 dark:text-red-300"
      : highlight === "yellow"
      ? "text-yellow-600 dark:text-yellow-300"
      : "text-slate-900 dark:text-white";

  const highlightBorder =
    highlight === "blue"
      ? "border-blue-600 dark:border-blue-400 border-2"
      : highlight === "red"
      ? "border-red-600 dark:border-red-400 border-2"
      : highlight === "yellow"
      ? "border-yellow-500 dark:border-yellow-400 border-2"
      : "border-slate-200 dark:border-tournament-dark-border border-2";

  return (
    <div
      className={`flex items-center gap-3 ${
        reverse ? "flex-row-reverse justify-end text-right" : ""
      }`}
    >
      <Image
        src={`/profile/${imageName}.webp`}
        alt={player.playerNickname}
        width={36}
        height={36}
        className={`w-9 h-9 rounded-full object-cover border ${
          highlight ? "border" : "border"
        } ${highlightBorder}`}
      />

      <div className="leading-tight max-w-full overflow-hidden">
        <p className={`font-semibold ${highlightText}`}>
          {player.playerNickname}
        </p>

        {(player.name || player.lastname) && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-20 sm:max-w-32 md:max-w-full">
            {player.name} {player.lastname}
          </p>
        )}
      </div>
    </div>
  );
};
