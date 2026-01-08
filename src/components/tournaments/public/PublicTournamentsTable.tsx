"use client";

import Link from "next/link";
import clsx from "clsx";
import { PublicTournamentsDateBadge } from "./PublicTournamentsDateBadge";

type TournamentStatus = "pending" | "in_progress" | "finished" | "cancelled";

type TournamentItem = {
  id: string;
  title: string;
  date: string;
  status: TournamentStatus;
  storeName?: string | null;
  playersCount?: number;
  tierName?: string | null;
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
  showStoreColumn?: boolean;
  showPlayersColumn?: boolean;
  showActionColumn?: boolean;
  showTierColumn?: boolean;
  onSelect?: (tournament: TournamentItem) => void;
  actionLabel?: string;
};

const openTournament = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export function PublicTournamentsTable({
  tournaments,
  statusConfig,
  showStoreColumn = true,
  showPlayersColumn = false,
  showActionColumn = true,
  showTierColumn = false,
  onSelect,
  actionLabel = "Ver torneo",
}: Props) {
  const isPublicView = !onSelect;

  return (
    <div className="hidden overflow-hidden rounded-xl border border-tournament-dark-accent bg-white shadow-sm dark:border-tournament-dark-accent dark:bg-tournament-dark-surface md:block">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-tournament-dark-header dark:text-slate-400">
          <tr className="text-xs">
            <th className="px-3 py-4">Evento</th>
            {showTierColumn && <th className="px-3 py-4">Tipo</th>}
            {showStoreColumn && <th className="px-3 py-4">Tienda</th>}
            <th className="px-3 py-4">Fecha</th>
            <th className="px-3 py-4">Estado</th>
            {showPlayersColumn && <th className="px-3 py-4">Jugadores</th>}
            {showActionColumn && (
              <th className="px-3 py-4 text-right">Acción</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-tournament-dark-accent">
          {tournaments.map((tournament) => {
            const status = statusConfig[tournament.status];
            const tournamentUrl = `/torneos/${tournament.id}`;
            const handleSelect = () => {
              if (onSelect) {
                onSelect(tournament);
                return;
              }
              openTournament(tournamentUrl);
            };
            return (
              <tr
                key={tournament.id}
                role="link"
                tabIndex={0}
                onClick={(event) => {
                  const target = event.target as HTMLElement;
                  // Evita abrir doble pestana cuando se hace clic en un enlace.
                  if (target.closest("a")) return;
                  handleSelect();
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  handleSelect();
                }}
                className="cursor-pointer transition-colors hover:bg-slate-50 focus-within:bg-slate-50 dark:hover:bg-tournament-dark-muted dark:focus-within:bg-tournament-dark-muted"
              >
                <td className="px-3 py-4 text-base font-semibold text-slate-900 dark:text-white">
                  {isPublicView ? (
                    <Link
                      href={tournamentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-purple-600 dark:hover:text-purple-300"
                    >
                      {tournament.title}
                    </Link>
                  ) : (
                    <span>{tournament.title}</span>
                  )}
                </td>
                {showTierColumn && (
                  <td className="px-3 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {tournament.tierName ?? "-"}
                  </td>
                )}
                {showStoreColumn && (
                  <td className="px-3 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {tournament.storeName ?? "-"}
                  </td>
                )}
                <td className="px-3 py-4">
                  <PublicTournamentsDateBadge value={tournament.date} />
                </td>
                <td className="px-3 py-4">
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                      status.className
                    )}
                  >
                    {status.label}
                  </span>
                </td>
                {showPlayersColumn && (
                  <td className="px-3 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {tournament.playersCount ?? "-"}
                  </td>
                )}
                {showActionColumn && isPublicView && (
                  <td className="px-3 py-4 text-right">
                    <Link
                      href={tournamentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-700 font-semibold hover:text-purple-500 dark:text-purple-300 dark:hover:text-purple-200"
                    >
                      {actionLabel}
                    </Link>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
