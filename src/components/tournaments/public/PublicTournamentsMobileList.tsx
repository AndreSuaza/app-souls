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

export function PublicTournamentsMobileList({
  tournaments,
  statusConfig,
}: Props) {
  return (
    <div className="space-y-3 md:hidden">
      {tournaments.map((tournament) => {
        const status = statusConfig[tournament.status];
        const tournamentUrl = `/torneos/${tournament.id}`;
        return (
          <div
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
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#362348] dark:bg-[#1f152a]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 flex-1 text-base font-semibold text-slate-900 line-clamp-2 dark:text-white">
                {tournament.title}
              </p>
              <span
                className={clsx(
                  "inline-flex shrink-0 items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset",
                  status.className
                )}
              >
                {status.label}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <PublicTournamentsDateBadge value={tournament.date} />
              <Link
                href={tournamentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-purple-700 hover:text-purple-500 dark:text-purple-300 dark:hover:text-purple-200"
              >
                Ver torneo
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
