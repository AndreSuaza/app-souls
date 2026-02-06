"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IoLocationOutline, IoStorefrontOutline } from "react-icons/io5";
import { FiRefreshCw } from "react-icons/fi";
import { getPublicTournamentDetailAction } from "@/actions";
import { Map, MarkdownContent, TournamentRankingPanel } from "@/components";
import { type MatchInterface, type PublicTournamentDetail } from "@/interfaces";
import { useToastStore, useUIStore } from "@/store";
import { MatchCard } from "../current-round/MarchCard";
import { RoundHistoryCardBase } from "../hisotry/RoundHistoryCardBase";
import { ResultButton } from "../current-round/ResultButton";

type Props = {
  initialTournament: PublicTournamentDetail;
};

const EMPTY_ROUNDS: [] = [];

export function PublicTournamentDetail({ initialTournament }: Props) {
  const [tournamentData, setTournamentData] =
    useState<PublicTournamentDetail>(initialTournament);
  const showLoading = useUIStore((s) => s.showLoading);
  const hideLoading = useUIStore((s) => s.hideLoading);
  const showToast = useToastStore((s) => s.showToast);

  const { tournament, players, rounds = EMPTY_ROUNDS, store } = tournamentData;

  // Valida coordenadas para renderizar el mapa solo si son confiables.
  const hasValidCoordinates =
    Number.isFinite(store.lat) &&
    Number.isFinite(store.lgn) &&
    Math.abs(store.lat) <= 90 &&
    Math.abs(store.lgn) <= 180;

  const currentRound = useMemo(() => {
    if (rounds.length === 0) return undefined;
    return rounds[rounds.length - 1];
  }, [rounds]);

  // Ordena la ronda actual primero y luego el resto en descendente.
  const historyRounds = useMemo(() => {
    if (!tournament || rounds.length === 0) return [];

    const currentRoundNumber =
      tournament.status === "finished"
        ? tournament.currentRoundNumber
        : tournament.currentRoundNumber + 1;

    return [...rounds].sort((a, b) => {
      if (a.roundNumber === currentRoundNumber) return -1;
      if (b.roundNumber === currentRoundNumber) return 1;
      return b.roundNumber - a.roundNumber;
    });
  }, [rounds, tournament]);

  const showCurrentRoundSection = tournament?.status === "in_progress";
  const showPodium = tournament?.status === "finished";

  useEffect(() => {
    hideLoading();
  }, [hideLoading]);

  const handleReload = useCallback(async () => {
    if (!tournament) return;
    showLoading("Actualizando torneo...");

    try {
      const refreshed = await getPublicTournamentDetailAction({
        tournamentId: tournament.id,
      });

      if (!refreshed) {
        showToast("Torneo no encontrado.", "error");
        return;
      }

      setTournamentData(refreshed);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el torneo",
        "error",
      );
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading, showToast, tournament]);

  // Render simple VS para rondas no finalizadas en vista publica/perfil
  const renderVS = () => (
    <div className="flex items-center justify-center w-full">
      <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
        VS
      </span>
    </div>
  );

  // Elimina el resultado solo para UI (no muta el original)
  const stripMatchResult = (match: MatchInterface): MatchInterface => ({
    ...match,
    result: null,
  });

  // Botones de resultado reutilizables renderizados en solo lectura.
  const renderResultButtons = (match: MatchInterface) => (
    <div className="grid grid-cols-3 gap-2 w-full md:flex md:items-center md:justify-center">
      <div className="flex justify-end">
        <ResultButton
          label="Victoria"
          variant="p1"
          active={match.result === "P1"}
          readOnly
          onClick={() => {}}
        />
      </div>

      <div className="flex justify-center">
        <ResultButton
          label="Empate"
          variant="draw"
          active={match.result === "DRAW"}
          readOnly
          onClick={() => {}}
        />
      </div>

      <div className="flex justify-start">
        <ResultButton
          label="Victoria"
          variant="p2"
          active={match.result === "P2"}
          readOnly
          onClick={() => {}}
        />
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen flex flex-col space-y-3 items-start justify-center bg-slate-50 text-slate-900 overflow-hidden px-3 pb-14 pt-2 md:pt-6 dark:bg-tournament-dark-bg dark:text-white sm:px-6 md:px-10 lg:px-16">
      <div className="absolute inset-0 hidden" />

      <div className="flex justify-start">
        <Link
          href="/torneos"
          className="inline-flex items-center gap-2 rounded-full border border-tournament-dark-accent px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-purple-600 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-muted dark:hover:text-purple-300"
        >
          Volver a torneos
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-6xl rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface md:p-8 flex flex-col gap-8">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-tournament-dark-accent bg-white p-5 dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                <IoStorefrontOutline className="text-purple-600 dark:text-purple-300" />
                Tienda organizadora
              </div>
              <h2 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                {store.name}
              </h2>

              <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-x-3 text-xl">
                  <IoLocationOutline className="mt-1.5 text-purple-600 dark:text-purple-300" />
                  <div>
                    <p>
                      {store.city}, {store.country}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      {store.address}
                    </p>
                  </div>
                </div>

                {tournament.description && (
                  <div className="mt-3">
                    <MarkdownContent
                      content={tournament.description}
                      className="text-base md:text-xl"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-tournament-dark-accent bg-white p-3 dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
              {hasValidCoordinates ? (
                <Map
                  className="h-[280px] w-full rounded-lg"
                  lat={store.lat}
                  lgn={store.lgn}
                  title={store.name}
                />
              ) : (
                <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-tournament-dark-accent bg-slate-50 text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-muted-strong dark:text-slate-300">
                  Mapa no disponible.
                </div>
              )}
            </div>
          </div>

          {tournament && (
            <div className="space-y-4">
              <div className="rounded-xl border border-tournament-dark-accent bg-white p-4 dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                      Torneo
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                      {tournament.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {tournament.status === "in_progress" && (
                      <button
                        type="button"
                        title="Actualizar torneo"
                        onClick={handleReload}
                        className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-purple-600 dark:text-slate-300 dark:hover:bg-tournament-dark-muted dark:hover:text-purple-300"
                      >
                        <FiRefreshCw className="h-4 w-4" />
                      </button>
                    )}
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        tournament.status === "in_progress"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200"
                          : tournament.status === "finished"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
                      }`}
                    >
                      {tournament.status === "in_progress"
                        ? "En progreso"
                        : tournament.status === "finished"
                          ? "Finalizado"
                          : "Pendiente"}
                    </span>
                  </div>
                </div>
              </div>

              {showCurrentRoundSection && (
                <>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200">
                    Ronda actual
                  </h3>

                  {currentRound ? (
                    <div className="flex flex-col gap-3">
                      {currentRound.matches.map((match, index) => (
                        <MatchCard
                          key={match.id}
                          match={stripMatchResult(match)}
                          tableNumber={index + 1}
                          players={players}
                          readOnly
                          decorated
                          renderResult={() => renderVS()}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-tournament-dark-accent bg-white p-6 text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
                      Aún no se ha generado la ronda actual.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {tournament && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200">
              Clasificación general
            </h3>

            <TournamentRankingPanel
              players={players}
              rounds={rounds}
              status={tournament.status}
              showPodium={showPodium}
              showTitle={false}
            />
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200">
            Historial de rondas
          </h3>

          {historyRounds.length === 0 ? (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-tournament-dark-accent bg-white p-6 text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
              Aún no se han generado rondas.
            </div>
          ) : (
            <div className="space-y-4">
              {historyRounds.map((round) => {
                const isCurrentRound =
                  tournament?.status === "in_progress" &&
                  round.roundNumber === tournament.currentRoundNumber + 1;

                const status = isCurrentRound ? "IN_PROGRESS" : "FINISHED";

                return (
                  <RoundHistoryCardBase
                    key={round.id}
                    round={round}
                    players={players}
                    status={status}
                    matches={
                      status === "IN_PROGRESS"
                        ? round.matches.map(stripMatchResult)
                        : round.matches
                    }
                    readOnly
                    allowExpand={false}
                    renderResult={(match) =>
                      status === "IN_PROGRESS"
                        ? renderVS()
                        : renderResultButtons(match)
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
