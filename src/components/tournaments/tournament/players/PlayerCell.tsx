"use client";

import { TournamentPlayerInterface } from "@/interfaces";

interface Props {
  player: TournamentPlayerInterface;
}

export const PlayerCell = ({ player }: Props) => {
  const imageName = player.image ?? "player";

  return (
    <div className="flex items-center gap-3">
      <img
        src={`/profile/${imageName}.webp`}
        alt={player.playerNickname}
        className="w-9 h-9 rounded-full object-cover border"
      />

      <div className="leading-tight">
        <p className="font-semibold">{player.playerNickname}</p>

        {(player.name || player.lastname) && (
          <p className="text-xs text-gray-500">
            {player.name} {player.lastname}
          </p>
        )}
      </div>
    </div>
  );
};
