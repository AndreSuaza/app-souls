"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { IoTrashOutline } from "react-icons/io5";
import { GiCardBurn } from "react-icons/gi";
import { TbCardsFilled } from "react-icons/tb";
import { TournamentPlayerInterface } from "@/interfaces";

type PlayerListViewProps = {
  players: TournamentPlayerInterface[];
  isFinished?: boolean;
  showMissingDeckIndicator?: boolean;
  onDeckClick?: (payload: { playerId: string; deckId: string }) => void;
  onDelete?: (playerId: string) => void;
};

export const PlayerListView = ({
  players,
  isFinished = false,
  showMissingDeckIndicator = false,
  onDeckClick,
  onDelete,
}: PlayerListViewProps) => {
  const shouldUseDeckModal = Boolean(onDeckClick);

  return (
    <ul>
      {players.map((p, idx) => (
        <li
          key={p.id}
          className="border-b border-tournament-dark-accent px-2 py-4 font-semibold text-slate-900 dark:border-tournament-dark-border dark:text-white"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="w-6 text-left text-slate-400 dark:text-slate-500">
                {idx + 1}
              </span>

              {/* Avatar */}
              <Image
                src={`/profile/${p.image ?? "player"}.webp`}
                alt={p.playerNickname}
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover border border-tournament-dark-accent dark:border-tournament-dark-border"
              />

              {/* Texto */}
              <div className="flex flex-col min-w-0">
                <span>{p.playerNickname}</span>

                {(p.name || p.lastname) && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {[p.name, p.lastname].filter(Boolean).join(" ")}
                  </span>
                )}
              </div>

              {p.deckId ? (
                shouldUseDeckModal ? (
                  <button
                    type="button"
                    title="Gestionar mazo asociado"
                    onClick={() =>
                      onDeckClick?.({ playerId: p.id, deckId: p.deckId! })
                    }
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-purple-300 hover:text-purple-600 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:text-purple-300"
                  >
                    <TbCardsFilled className="h-4 w-4" />
                  </button>
                ) : (
                  <Link
                    href={`/mazos/${p.deckId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver mazo jugado"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-purple-300 hover:text-purple-600 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:text-purple-300"
                  >
                    <TbCardsFilled className="h-4 w-4" />
                  </Link>
                )
              ) : (
                showMissingDeckIndicator && (
                  <span
                    title="Falta asociar mazo"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 text-rose-500 dark:border-rose-500/50 dark:text-rose-400"
                  >
                    <GiCardBurn className="h-4 w-4" />
                  </span>
                )
              )}
            </div>

            {/* Mostrar ícono de eliminar solo si hay callback */}
            {onDelete && (
              <IoTrashOutline
                className={clsx(
                  "w-6 h-6",
                  isFinished
                    ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                    : "text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 cursor-pointer"
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
