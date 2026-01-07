"use client";

import clsx from "clsx";

type TournamentStatus = "pending" | "in_progress" | "finished" | "cancelled";

export type AdminTournamentStatusConfig = Record<
  TournamentStatus,
  { label: string; className: string }
>;

export type AdminTournamentRow = {
  id: string;
  title: string;
  date: string;
  status: TournamentStatus;
  playersCount: number;
};

export type AdminTournamentsTableClassNames = {
  container?: string;
  table?: string;
  head?: string;
  headCell?: string;
  body?: string;
  row?: string;
  cell?: string;
  titleCell?: string;
  statusCell?: string;
  statusBadge?: string;
  dateBadge?: string;
};

type Props = {
  tournaments: AdminTournamentRow[];
  statusConfig: AdminTournamentStatusConfig;
  formatDate: (value: string) => string;
  onSelect: (id: string, status: TournamentStatus) => void;
  classNames?: AdminTournamentsTableClassNames;
};

export const AdminTournamentsTable = ({
  tournaments,
  statusConfig,
  formatDate,
  onSelect,
  classNames,
}: Props) => {
  return (
    <div
      className={clsx(
        "hidden md:block overflow-hidden rounded-xl border border-slate-200 dark:border-tournament-dark-accent bg-white dark:bg-tournament-dark-surface shadow-sm",
        classNames?.container
      )}
    >
      <table className={clsx("min-w-full text-sm", classNames?.table)}>
        <thead
          className={clsx(
            "text-left text-xs uppercase tracking-wide",
            classNames?.head ??
              "bg-slate-50 text-slate-500 dark:bg-tournament-dark-header dark:text-slate-400 border-b border-slate-200 dark:border-tournament-dark-accent"
          )}
        >
          <tr>
            <th className={clsx("px-4 py-3", classNames?.headCell)}>Fecha</th>
            <th className={clsx("px-4 py-3", classNames?.headCell)}>Nombre</th>
            <th className={clsx("px-4 py-3", classNames?.headCell)}>
              Jugadores
            </th>
            <th className={clsx("px-4 py-3", classNames?.headCell)}>Estado</th>
          </tr>
        </thead>
        <tbody
          className={clsx(
            classNames?.body ??
              "divide-y divide-slate-200 dark:divide-tournament-dark-accent"
          )}
        >
          {tournaments.map((tournament) => {
            const isDisabled = tournament.status === "cancelled";
            const status = statusConfig[tournament.status];

            return (
              <tr
                key={tournament.id}
                role={isDisabled ? "row" : "button"}
                tabIndex={isDisabled ? -1 : 0}
                onClick={() => onSelect(tournament.id, tournament.status)}
                onKeyDown={(event) => {
                  if (
                    !isDisabled &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    onSelect(tournament.id, tournament.status);
                  }
                }}
                className={clsx(
                  "transition-colors",
                  classNames?.row ??
                    (isDisabled
                      ? "bg-slate-50 text-slate-400 dark:bg-tournament-dark-muted-strong dark:text-slate-500"
                      : "cursor-pointer hover:bg-slate-50 dark:hover:bg-tournament-dark-muted")
                )}
              >
                <td className={clsx("px-4 py-3", classNames?.cell)}>
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                      classNames?.dateBadge ??
                        "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-tournament-dark-muted dark:text-slate-200 dark:ring-tournament-dark-accent"
                    )}
                  >
                    {formatDate(tournament.date)}
                  </span>
                </td>
                <td
                  className={clsx(
                    "px-4 py-3 font-medium",
                    classNames?.titleCell ?? "text-slate-900 dark:text-white"
                  )}
                >
                  {tournament.title}
                </td>
                <td className={clsx("px-4 py-3", classNames?.cell)}>
                  {tournament.playersCount}
                </td>
                <td className={clsx("px-4 py-3", classNames?.statusCell)}>
                  <span
                    className={clsx(
                      "rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset",
                      status.className,
                      classNames?.statusBadge
                    )}
                  >
                    {status.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
