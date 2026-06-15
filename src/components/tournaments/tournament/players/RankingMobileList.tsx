"use client";

import clsx from "clsx";
import { RoundInterface, TournamentPlayerInterface } from "@/interfaces";
import { RankBadge } from "./RankBadge";
import { PlayerCell } from "./PlayerCell";
import { calculatePlayerRecord, formatRecord } from "@/utils/ranking";

export type RankingMobileListClassNames = {
  wrapper?: string;
  card?: string;
  meta?: string;
  metaSecondary?: string;
};

interface Props {
  players: TournamentPlayerInterface[];
  rounds: RoundInterface[];
  currentPage: number;
  pageSize: number;
  showPodium?: boolean;
  showDeckLink?: boolean;
  topCutPvByPlayerId?: ReadonlyMap<string, number>;
  classNames?: RankingMobileListClassNames;
}

export const RankingMobileList = ({
  players,
  rounds,
  currentPage,
  pageSize,
  showPodium = true,
  showDeckLink = false,
  topCutPvByPlayerId,
  classNames,
}: Props) => {
  return (
    <div className={clsx("md:hidden space-y-3", classNames?.wrapper)}>
      {players.map((player, index) => {
        const rank = (currentPage - 1) * pageSize + index + 1;
        const topCutPv = topCutPvByPlayerId?.get(player.id);

        return (
          <div
            key={player.id}
            className={clsx(
              "border rounded-md p-3 flex items-center justify-between bg-white border-slate-200 dark:bg-tournament-dark-surface dark:border-tournament-dark-border",
              classNames?.card
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <RankBadge rank={rank} showPodium={showPodium} />
              <div className="min-w-0">
                <PlayerCell player={player} showDeckLink={showDeckLink} />
                {topCutPv !== undefined && (
                  <span className="mt-1 inline-flex rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                    +{topCutPv} PV
                  </span>
                )}
              </div>
            </div>

            <div
              className={clsx(
                "text-right text-sm text-slate-700 dark:text-slate-200",
                classNames?.meta
              )}
            >
              <p className="font-bold">{player.points} pts</p>
              <p
                className={clsx(
                  "text-slate-500 dark:text-slate-400",
                  classNames?.metaSecondary
                )}
              >
                DE {player.buchholz}
              </p>
              <p>{formatRecord(calculatePlayerRecord(player.id, rounds))}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
