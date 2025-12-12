"use client";

import clsx from "clsx";
import { IoTrashOutline } from "react-icons/io5";

type PlayerListViewProps = {
  players: {
    id: string;
    playerNickname: string;
    name?: string | null;
    lastname?: string | null;
  }[];
  isFinished?: boolean;
  onDelete?: (playerId: string) => void;
};

export const PlayerListView = ({
  players,
  isFinished = false,
  onDelete,
}: PlayerListViewProps) => {
  return (
    <ul>
      {players.map((p, idx) => (
        <li key={p.id} className="border-b px-2 py-4 font-semibold">
          <div className="flex justify-between items-center">
            <span className="w-6 text-left text-gray-400">{idx + 1}</span>

            <div className="ml-4 flex flex-col flex-1 text-left">
              <span>{p.playerNickname}</span>

              {(p.name || p.lastname) && (
                <span className="text-xs text-gray-400">
                  {[p.name, p.lastname].filter(Boolean).join(" ")}
                </span>
              )}
            </div>

            {/* Mostrar ícono de eliminar solo si hay callback */}
            {onDelete && (
              <IoTrashOutline
                className={clsx(
                  "w-6 h-6",
                  isFinished
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-400 hover:text-red-600 cursor-pointer"
                )}
                onClick={() => {
                  if (!isFinished && onDelete) onDelete(p.id);
                }}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};
