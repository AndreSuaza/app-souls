"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { MdBarChart, MdEmojiEvents } from "react-icons/md";
import { PaginationLine } from "@/components/ui";
import { PublicTournamentsTable } from "./PublicTournamentsTable";
import { PublicTournamentsMobileList } from "./PublicTournamentsMobileList";
import { RankBadge } from "../tournament/players/RankBadge";

type TournamentStatus = "pending" | "in_progress" | "finished" | "cancelled";

type TournamentItem = {
  id: string;
  title: string;
  date: string;
  status: TournamentStatus;
  storeName?: string | null;
  tierName?: string | null;
};

type TopPlayer = {
  id: string;
  nickname: string;
  name: string;
  lastname: string;
  image: string;
  eloPoints: number;
  winrate: number;
};

type StatusConfig = Record<
  TournamentStatus,
  {
    label: string;
    className: string;
  }
>;

type Props = {
  tierTournaments: TournamentItem[];
  topPlayers: TopPlayer[];
};

const PAGE_SIZE = 6;

const statusConfig: StatusConfig = {
  in_progress: {
    label: "En progreso",
    className:
      "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-500/30",
  },
  pending: {
    label: "Programado",
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-500/30",
  },
  finished: {
    label: "Finalizado",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-500/30",
  },
  cancelled: {
    label: "Cancelado",
    className:
      "bg-slate-200 text-slate-600 ring-slate-300 dark:bg-tournament-dark-muted dark:text-slate-400 dark:ring-tournament-dark-accent",
  },
};

export function PublicTournamentsHighlights({
  tierTournaments,
  topPlayers,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(tierTournaments.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return tierTournaments.slice(start, start + PAGE_SIZE);
  }, [tierTournaments, currentPage]);

  useEffect(() => {
    if (currentPage <= totalPages) return;
    setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <section className="grid space-y-4 md:space-y-0 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            <MdEmojiEvents className="h-5 w-5 text-amber-500 dark:text-amber-300" />
            Torneos destacados
          </h2>
        </div>

        {tierTournaments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-tournament-dark-accent bg-white p-6 text-center text-sm text-slate-500 dark:border-tournament-dark-accent dark:bg-tournament-dark-surface dark:text-slate-300">
            No hay torneos Tier 1 o Tier 2 disponibles.
          </div>
        ) : (
          <>
            <PublicTournamentsTable
              tournaments={paginated}
              statusConfig={statusConfig}
              showTierColumn={false}
              showPlayersColumn={false}
              showActionColumn
            />
            <PublicTournamentsMobileList
              tournaments={paginated}
              statusConfig={statusConfig}
            />
            {totalPages > 1 && (
              <PaginationLine
                totalPages={totalPages}
                currentPage={currentPage}
                pathname={pathname}
                searchParams={searchParams}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <MdBarChart className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            Top jugadores
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-tournament-dark-accent bg-white shadow-sm dark:border-tournament-dark-accent dark:bg-tournament-dark-surface">
          <ul className="divide-y divide-slate-200 dark:divide-tournament-dark-accent">
            {topPlayers.map((player, index) => (
              <li
                key={player.id}
                className="flex items-center justify-between gap-4 px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <RankBadge rank={index + 1} showPodium />
                  <Image
                    src={`/profile/${player.image}.webp`}
                    alt={player.nickname}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-tournament-dark-border"
                  />
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {player.nickname}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {player.name || player.lastname
                        ? `${player.name} ${player.lastname}`.trim()
                        : "Jugador"}{" "}
                      · {player.winrate}% Winrate
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-300">
                    {player.eloPoints}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Elo
                  </p>
                </div>
              </li>
            ))}

            {topPlayers.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-300">
                Aún no hay jugadores con Elo disponible.
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
