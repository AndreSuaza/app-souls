"use client";

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
      ? "text-indigo-600"
      : highlight === "red"
      ? "text-red-600"
      : highlight === "yellow"
      ? "text-yellow-600"
      : "";

  const highlightBorder =
    highlight === "blue"
      ? "border-indigo-600 border-2"
      : highlight === "red"
      ? "border-red-600 border-2"
      : highlight === "yellow"
      ? "border-yellow-500 border-2"
      : "border-gray-200 border-2";

  return (
    <div
      className={`flex items-center gap-3 ${
        reverse ? "flex-row-reverse justify-end text-right" : ""
      }`}
    >
      <img
        src={`/profile/${imageName}.webp`}
        alt={player.playerNickname}
        className={`w-9 h-9 rounded-full object-cover border ${
          highlight ? "border" : "border"
        } ${highlightBorder}`}
      />

      <div className="leading-tight max-w-full overflow-hidden">
        <p className={`font-semibold ${highlightText}`}>
          {player.playerNickname}
        </p>

        {(player.name || player.lastname) && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {player.name} {player.lastname}
          </p>
        )}
      </div>
    </div>
  );
};
