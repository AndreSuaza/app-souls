"use client";

import Link from "next/link";
import clsx from "clsx";
import { PublicTournamentsDateBadge } from "./PublicTournamentsDateBadge";

type TournamentStatus = "pending" | "in_progress";

type TournamentItem = {
  id: string;
  title: string;
  date: string;
  status: TournamentStatus;
};

type StatusConfig = Record<
  TournamentStatus,
  {
    label: string;
    className: string;
  }
>;

type Props = {
  tournaments: TournamentItem[];
  statusConfig: StatusConfig;
};

const openTournament = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export function PublicTournamentsTable({ tournaments, statusConfig }: Props) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-tournament-dark-accent dark:bg-tournament-dark-surface md:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-tournament-dark-header dark:text-slate-400">
          <tr>
            <th className="px-6 py-4">Evento</th>
            <th className="px-6 py-4">Fecha</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4 text-right">Accion</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-tournament-dark-accent">
          {tournaments.map((tournament) => {
            const status = statusConfig[tournament.status];
            const tournamentUrl = `/torneos/${tournament.id}`;
            return (
              <tr
                key={tournament.id}
                role="link"
                tabIndex={0}
                onClick={(event) => {
                  const target = event.target as HTMLElement;
                  // Evita abrir doble pestana cuando se hace clic en un enlace.
                  if (target.closest("a")) return;
                  openTournament(tournamentUrl);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  openTournament(tournamentUrl);
                }}
                className="cursor-pointer transition-colors hover:bg-slate-50 focus-within:bg-slate-50 dark:hover:bg-tournament-dark-muted dark:focus-within:bg-tournament-dark-muted"
              >
                <td className="px-6 py-4 text-base font-semibold text-slate-900 dark:text-white">
                  <Link
                    href={tournamentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-purple-600 dark:hover:text-purple-300"
                  >
                    {tournament.title}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <PublicTournamentsDateBadge value={tournament.date} />
                </td>
                <td className="px-6 py-4">
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                      status.className
                    )}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={tournamentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-700 font-semibold hover:text-purple-500 dark:text-purple-300 dark:hover:text-purple-200"
                  >
                    Ver torneo
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
