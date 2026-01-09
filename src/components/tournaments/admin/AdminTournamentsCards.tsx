"use client";

import clsx from "clsx";
import type {
  AdminTournamentStatusConfig,
  AdminTournamentRow,
} from "./AdminTournamentsTable";

export type AdminTournamentsCardsClassNames = {
  container?: string;
  card?: string;
  title?: string;
  statusBadge?: string;
  metaRow?: string;
  dateBadge?: string;
  playersText?: string;
};

type Props = {
  tournaments: AdminTournamentRow[];
  statusConfig: AdminTournamentStatusConfig;
  formatDate: (value: string) => string;
  onSelect: (id: string, status: AdminTournamentRow["status"]) => void;
  classNames?: AdminTournamentsCardsClassNames;
};

export const AdminTournamentsCards = ({
  tournaments,
  statusConfig,
  formatDate,
  onSelect,
  classNames,
}: Props) => {
  return (
    <div className={clsx("space-y-4 md:hidden", classNames?.container)}>
      {tournaments.map((tournament) => {
        const isDisabled = tournament.status === "cancelled";
        const status = statusConfig[tournament.status];

        return (
          <div
            key={tournament.id}
            onClick={() => onSelect(tournament.id, tournament.status)}
            className={clsx(
              "rounded-xl border border-tournament-dark-accent dark:border-tournament-dark-border p-4 transition-colors",
              classNames?.card ??
                (isDisabled
                  ? "bg-slate-50 text-slate-400 dark:bg-tournament-dark-muted-strong dark:text-slate-500"
                  : "bg-white dark:bg-tournament-dark-surface cursor-pointer hover:bg-slate-50 dark:hover:bg-tournament-dark-muted")
            )}
          >
            <div className="flex items-center justify-between">
              <p
                className={clsx(
                  "text-sm font-semibold",
                  classNames?.title ?? "text-slate-900 dark:text-white"
                )}
              >
                {tournament.title}
              </p>
              <span
                className={clsx(
                  "rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset",
                  status.className,
                  classNames?.statusBadge
                )}
              >
                {status.label}
              </span>
            </div>
            <div
              className={clsx(
                "mt-2 flex items-center justify-between text-xs",
                classNames?.metaRow ?? "text-slate-500 dark:text-slate-400"
              )}
            >
              <span
                className={clsx(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
                  classNames?.dateBadge ??
                    "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-tournament-dark-muted dark:text-slate-200 dark:ring-tournament-dark-accent"
                )}
              >
                {formatDate(tournament.date)}
              </span>
              <span className={classNames?.playersText}>
                {tournament.playersCount} jugadores
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
