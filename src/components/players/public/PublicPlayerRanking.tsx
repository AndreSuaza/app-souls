"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiChevronRight, FiMapPin, FiSearch, FiTarget } from "react-icons/fi";
import type { PublicPlayerRankingItem } from "@/interfaces";
import { getAvatarUrl } from "@/utils/avatar-image";

type Props = {
  players: PublicPlayerRankingItem[];
};

const rankTone = (rank: number) => {
  if (rank === 1) {
    return {
      border: "border-amber-400/70",
      text: "text-amber-600 dark:text-amber-300",
      accent: "bg-amber-400",
      badge:
        "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200",
    };
  }

  if (rank === 2) {
    return {
      border: "border-slate-400/70",
      text: "text-slate-500 dark:text-slate-200",
      accent: "bg-slate-400",
      badge:
        "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-400/40 dark:bg-slate-300/10 dark:text-slate-200",
    };
  }

  if (rank === 3) {
    return {
      border: "border-orange-500/60",
      text: "text-orange-700 dark:text-orange-300",
      accent: "bg-orange-500",
      badge:
        "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-400/40 dark:bg-orange-400/10 dark:text-orange-200",
    };
  }

  return {
    border: "border-purple-400/45 dark:border-tournament-dark-accent",
    text: "text-purple-700 dark:text-purple-300",
    accent: "bg-teal-400",
    badge:
      "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-400/30 dark:bg-purple-500/10 dark:text-purple-200",
  };
};

const getFullName = (player: PublicPlayerRankingItem) =>
  [player.name, player.lastname].filter(Boolean).join(" ") || "Jugador Souls";

const getLocation = (player: PublicPlayerRankingItem) =>
  [player.city, player.storeName].filter(Boolean).join(" · ") ||
  "Circuito Souls";

const PlayerAvatar = ({
  player,
  className,
  sizes,
}: {
  player: PublicPlayerRankingItem;
  className: string;
  sizes: string;
}) => (
  <Image
    src={getAvatarUrl(player.image)}
    alt={`Avatar de ${player.nickname}`}
    title={player.nickname}
    fill
    sizes={sizes}
    className={className}
  />
);

export const PublicPlayerRanking = ({ players }: Props) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const elitePlayers = players.slice(0, 9);
  const champion = elitePlayers[0] ?? null;
  const contenders = elitePlayers.slice(1);
  const rankedPlayers = players.slice(9);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const filteredPlayers = useMemo(() => {
    const normalized = debouncedSearch.trim().toLocaleLowerCase("es");
    if (!normalized) return rankedPlayers;

    return rankedPlayers.filter((player) =>
      [player.nickname, player.name, player.lastname]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase("es").includes(normalized)),
    );
  }, [debouncedSearch, rankedPlayers]);

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-900 dark:bg-[#100a16] dark:text-white">
      <section className="relative isolate min-h-[420px] overflow-hidden border-b border-slate-200 dark:border-tournament-dark-border">
        <Image
          src="/souls-in-xtinction.webp"
          alt="Universo competitivo de Souls In Xtinction"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/50 dark:bg-[#100a16]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f3eff8]/75 via-[#f3eff8]/36 to-[#e9f6f4]/20 dark:from-[#100a16] dark:via-[#100a16]/88 dark:to-[#100a16]/55" />

        <div className="relative mx-auto flex min-h-[420px] w-full max-w-7xl flex-col justify-center px-5 py-20 sm:px-8 lg:px-12">
          <p className="text-xs font-black uppercase tracking-[0.34em] text-purple-700 dark:text-purple-300">
            Circuito competitivo
          </p>
          <h1 className="mt-5 max-w-4xl font-['Bebas_Neue'] text-6xl uppercase leading-[0.9] tracking-wide text-[#251431] sm:text-8xl dark:text-white">
            Clasificación de Almas
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg dark:text-slate-200">
            Conoce a los jugadores que lideran el circuito de Souls In Xtinction
            y consulta la clasificación oficial del Top 100.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.18em]">
            <span className="rounded-lg border border-purple-300 bg-white/55 px-4 py-2 text-purple-800 backdrop-blur dark:border-purple-400/40 dark:bg-purple-500/10 dark:text-purple-200">
              Top 100 oficial
            </span>
            <span className="rounded-lg border border-teal-300 bg-white/55 px-4 py-2 text-teal-800 backdrop-blur dark:border-teal-400/40 dark:bg-teal-400/10 dark:text-teal-200">
              Ranking por ELO
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 lg:px-12">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-600 dark:text-amber-300">
              Élite del circuito
            </p>
            <h2 className="mt-3 font-['Bebas_Neue'] text-5xl uppercase tracking-wide text-slate-950 dark:text-white">
              Top 9 jugadores
            </h2>
          </div>
          <p className="hidden max-w-md text-right text-sm text-slate-500 md:block dark:text-slate-400">
            Los nueve jugadores con mayor puntuación competitiva vigente.
          </p>
        </div>

        {champion ? (
          <section className="space-y-4">
            <article
              className={`group relative overflow-hidden rounded-lg border bg-white shadow-xl transition duration-300 hover:-translate-y-1 dark:bg-tournament-dark-surface ${rankTone(1).border}`}
            >
              <div
                className={`absolute inset-y-0 left-0 w-1 ${rankTone(1).accent}`}
              />
              <div className="grid md:grid-cols-[290px_minmax(0,1fr)]">
                <div className="relative min-h-[300px] overflow-hidden bg-slate-200 md:min-h-[350px] dark:bg-tournament-dark-muted">
                  <PlayerAvatar
                    player={champion}
                    sizes="(max-width: 768px) 100vw, 290px"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-5 font-['Bebas_Neue'] text-8xl leading-none text-amber-300">
                    01
                  </span>
                </div>

                <div className="flex min-w-0 flex-col justify-between p-6 sm:p-8">
                  <div>
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <span
                          className={`inline-flex rounded-lg border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${rankTone(1).badge}`}
                        >
                          Campeón del ranking
                        </span>
                        <h3 className="mt-4 break-words font-['Bebas_Neue'] text-5xl uppercase leading-none tracking-wide text-slate-950 sm:text-6xl dark:text-white">
                          {champion.nickname}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                          {getFullName(champion)}
                        </p>
                        <p className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <FiMapPin className="h-4 w-4 text-teal-500" />
                          {getLocation(champion)}
                        </p>
                      </div>

                      <div className="border-l-2 border-amber-400 pl-4 sm:text-right">
                        <p className="font-['Bebas_Neue'] text-5xl text-purple-700 dark:text-purple-300">
                          {champion.eloPoints}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                          Puntos ELO
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                      {[
                        ["Victorias", champion.eloPoints],
                        ["Partidas", champion.matchesPlayed],
                        ["Torneos", champion.tournamentsPlayed],
                        ["Rendimiento", `${champion.winrate}%`],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-lg border-b border-slate-200 bg-slate-50 p-4 dark:border-tournament-dark-accent dark:bg-tournament-dark-muted-strong"
                        >
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                            {label}
                          </p>
                          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/perfil/${encodeURIComponent(champion.nickname)}`}
                    className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg border border-purple-500 bg-purple-600 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-purple-500"
                  >
                    Ver perfil
                    <FiChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>

            <div className="grid gap-4 md:grid-cols-2">
              {contenders.map((player) => {
                const tone = rankTone(player.rank);
                return (
                  <Link
                    key={player.id}
                    href={`/perfil/${encodeURIComponent(player.nickname)}`}
                    className={`group relative grid min-h-[150px] grid-cols-[118px_minmax(0,1fr)] overflow-hidden rounded-lg border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-tournament-dark-surface ${tone.border}`}
                  >
                    <div className="relative min-h-[150px] overflow-hidden bg-slate-200 dark:bg-tournament-dark-muted">
                      <PlayerAvatar
                        player={player}
                        sizes="118px"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                      <span
                        className={`absolute left-3 top-2 font-['Bebas_Neue'] text-4xl ${tone.text}`}
                      >
                        {String(player.rank).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-col justify-center p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words font-['Bebas_Neue'] text-2xl uppercase tracking-wide text-slate-950 dark:text-white">
                            {player.nickname}
                          </h3>
                          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                            {getFullName(player)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                            {player.eloPoints}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            ELO
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="min-w-0 truncate text-xs text-slate-500 dark:text-slate-400">
                          {getLocation(player)}
                        </p>
                        <span className="shrink-0 text-xs font-bold text-teal-700 dark:text-teal-300">
                          {player.winrate}%
                        </span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden bg-slate-200 dark:bg-tournament-dark-muted">
                        <div
                          className="h-full bg-teal-400"
                          style={{ width: `${player.winrate}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
            Aún no hay jugadores disponibles para construir el ranking.
          </div>
        )}

        <section className="mt-20">
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between dark:border-tournament-dark-border">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-teal-700 dark:text-teal-300">
                Clasificación oficial
              </p>
              <h2 className="mt-3 font-['Bebas_Neue'] text-4xl uppercase tracking-wide text-slate-950 sm:text-5xl dark:text-white">
                Posiciones 10 al 100
              </h2>
            </div>

            <label className="relative block w-full md:max-w-sm">
              <span className="sr-only">Buscar jugador</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar jugador"
                className="h-11 w-full border-0 border-b border-slate-300 bg-transparent pl-0 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-0 dark:border-tournament-dark-accent dark:text-white dark:placeholder:text-slate-500"
              />
              <FiSearch className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </label>
          </div>

          <div className="mt-6 max-h-[720px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
            <div className="sticky top-0 z-10 hidden grid-cols-[80px_minmax(0,1fr)_160px_112px_48px] border-b border-slate-200 bg-slate-100 text-xs font-black uppercase tracking-widest text-slate-500 md:grid lg:grid-cols-[80px_minmax(0,1fr)_240px_180px_112px_48px] dark:border-tournament-dark-border dark:bg-tournament-dark-muted-strong dark:text-slate-400">
              <span className="p-4">Pos.</span>
              <span className="p-4">Jugador</span>
              <span className="hidden p-4 lg:block">Circuito</span>
              <span className="p-4">Rendimiento</span>
              <span className="p-4 text-right">ELO</span>
              <span className="sr-only">Perfil</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-tournament-dark-border/70">
              {filteredPlayers.map((player) => (
                <Link
                  key={player.id}
                  href={`/perfil/${encodeURIComponent(player.nickname)}`}
                  title={`Ver perfil de ${player.nickname}`}
                  className="group grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 p-3 transition hover:bg-purple-50 active:bg-purple-50 md:grid-cols-[80px_minmax(0,1fr)_160px_112px_48px] md:gap-0 md:p-0 lg:grid-cols-[80px_minmax(0,1fr)_240px_180px_112px_48px] dark:hover:bg-tournament-dark-muted dark:active:bg-tournament-dark-muted"
                >
                  <span className="font-['Bebas_Neue'] text-2xl text-slate-500 md:p-4 dark:text-slate-300">
                    {String(player.rank).padStart(2, "0")}
                  </span>

                  <span className="flex min-w-0 items-center gap-3 md:p-4">
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200 md:h-10 md:w-10 dark:border-tournament-dark-accent">
                      <PlayerAvatar
                        player={player}
                        sizes="40px"
                        className="object-cover"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-slate-950 dark:text-white">
                        {player.nickname}
                      </span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        <span className="md:hidden">{getLocation(player)}</span>
                        <span className="hidden md:inline">
                          {getFullName(player)}
                        </span>
                      </span>
                    </span>
                  </span>

                  <span className="hidden p-4 text-sm text-slate-500 lg:block dark:text-slate-300">
                    {getLocation(player)}
                  </span>

                  <span className="hidden items-center gap-3 p-4 md:flex">
                    <span className="h-1.5 flex-1 overflow-hidden bg-slate-200 dark:bg-tournament-dark-muted">
                      <span
                        className="block h-full bg-teal-400"
                        style={{ width: `${player.winrate}%` }}
                      />
                    </span>
                    <span className="w-10 text-right text-xs font-bold text-teal-700 dark:text-teal-300">
                      {player.winrate}%
                    </span>
                  </span>

                  <span className="text-right">
                    <span className="block font-bold text-purple-700 md:p-4 dark:text-purple-300">
                      {player.eloPoints}
                    </span>
                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 md:hidden">
                      ELO
                    </span>
                  </span>

                  <span className="hidden h-full items-center justify-center text-slate-500 transition group-hover:text-purple-700 md:flex dark:text-slate-300 dark:group-hover:text-purple-300">
                    <FiChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {filteredPlayers.length === 0 && (
            <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
              <FiTarget className="mx-auto h-8 w-8 text-purple-500" />
              <p className="mt-3 font-semibold text-slate-800 dark:text-white">
                No encontramos jugadores
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Prueba con otro nickname o nombre.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
