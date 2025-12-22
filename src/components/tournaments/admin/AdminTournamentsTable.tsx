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

type Props = {
  tournaments: AdminTournamentRow[];
  statusConfig: AdminTournamentStatusConfig;
  formatDate: (value: string) => string;
  onSelect: (id: string, status: TournamentStatus) => void;
};

export const AdminTournamentsTable = ({
  tournaments,
  statusConfig,
  formatDate,
  onSelect,
}: Props) => {
  return (
    <div className="hidden md:block overflow-hidden rounded-lg border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Jugadores</th>
            <th className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
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
                  isDisabled
                    ? "bg-gray-50 text-gray-400"
                    : "cursor-pointer hover:bg-gray-50"
                )}
              >
                <td className="px-4 py-3">{formatDate(tournament.date)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {tournament.title}
                </td>
                <td className="px-4 py-3">{tournament.playersCount}</td>
                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      "rounded-full px-2 py-1 text-xs font-semibold",
                      status.className
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
