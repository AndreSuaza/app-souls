"use client";

import clsx from "clsx";
import { RoundInterface, TournamentPlayerInterface } from "@/interfaces";
import { RankBadge } from "./RankBadge";
import { PlayerCell } from "./PlayerCell";
import { calculatePlayerRecord, formatRecord } from "@/utils/ranking";

export type RankingDesktopTableClassNames = {
  wrapper?: string;
  table?: string;
  headerRow?: string;
  headerCell?: string;
  row?: string;
  cell?: string;
};

interface Props {
  players: TournamentPlayerInterface[];
  rounds: RoundInterface[];
  currentPage: number;
  pageSize: number;
  showPodium?: boolean;
  classNames?: RankingDesktopTableClassNames;
}

export const RankingDesktopTable = ({
  players,
  rounds,
  currentPage,
  pageSize,
  showPodium = true,
  classNames,
}: Props) => {
  return (
    <div className={clsx("hidden md:block", classNames?.wrapper)}>
      <table className={clsx("w-full border-collapse", classNames?.table)}>
        <thead>
          <tr
            className={clsx(
              "text-sm text-slate-500 border-b border-slate-200 dark:text-slate-400 dark:border-tournament-dark-border",
              classNames?.headerRow
            )}
          >
            <th
              className={clsx("py-2 text-left w-12", classNames?.headerCell)}
            >
              #
            </th>
            <th className={clsx("py-2 text-left", classNames?.headerCell)}>
              Jugador
            </th>
            <th className={clsx("py-2 text-center", classNames?.headerCell)}>
              Puntos
            </th>
            <th className={clsx("py-2 text-center", classNames?.headerCell)}>
              Buchholz
            </th>
            <th className={clsx("py-2 text-center", classNames?.headerCell)}>
              Record
            </th>
          </tr>
        </thead>

        <tbody>
          {players.map((player, index) => {
            const rank = (currentPage - 1) * pageSize + index + 1;

            return (
              <tr
                key={player.id}
                className={clsx(
                  "border-b last:border-none border-slate-200 dark:border-tournament-dark-border",
                  classNames?.row
                )}
              >
                <td
                  className={clsx(
                    "py-3 text-slate-700 dark:text-slate-200",
                    classNames?.cell
                  )}
                >
                  <RankBadge rank={rank} showPodium={showPodium} />
                </td>

                <td
                  className={clsx(
                    "py-3 text-slate-700 dark:text-slate-200",
                    classNames?.cell
                  )}
                >
                  <PlayerCell player={player} showDeckLink />
                </td>

                <td
                  className={clsx(
                    "py-3 text-center font-bold text-slate-700 dark:text-slate-200",
                    classNames?.cell
                  )}
                >
                  {player.points}
                </td>

                <td
                  className={clsx(
                    "py-3 text-center text-slate-700 dark:text-slate-200",
                    classNames?.cell
                  )}
                >
                  {player.buchholz}
                </td>

                <td
                  className={clsx(
                    "py-3 text-center text-slate-700 dark:text-slate-200",
                    classNames?.cell
                  )}
                >
                  {formatRecord(calculatePlayerRecord(player.id, rounds))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
