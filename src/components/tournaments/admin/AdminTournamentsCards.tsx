"use client";

import clsx from "clsx";
import type {
  AdminTournamentStatusConfig,
  AdminTournamentRow,
} from "./AdminTournamentsTable";

type Props = {
  tournaments: AdminTournamentRow[];
  statusConfig: AdminTournamentStatusConfig;
  formatDate: (value: string) => string;
  onSelect: (id: string, status: AdminTournamentRow["status"]) => void;
};

export const AdminTournamentsCards = ({
  tournaments,
  statusConfig,
  formatDate,
  onSelect,
}: Props) => {
  return (
    <div className="space-y-3 md:hidden">
      {tournaments.map((tournament) => {
        const isDisabled = tournament.status === "cancelled";
        const status = statusConfig[tournament.status];

        return (
          <div
            key={tournament.id}
            onClick={() => onSelect(tournament.id, tournament.status)}
            className={clsx(
              "rounded-lg border bg-white p-4 transition-colors",
              isDisabled
                ? "bg-gray-50 text-gray-400"
                : "cursor-pointer hover:bg-gray-50"
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">
                {tournament.title}
              </p>
              <span
                className={clsx(
                  "rounded-full px-2 py-1 text-xs font-semibold",
                  status.className
                )}
              >
                {status.label}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                {formatDate(tournament.date)}
              </span>
              <span>{tournament.playersCount} jugadores</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
