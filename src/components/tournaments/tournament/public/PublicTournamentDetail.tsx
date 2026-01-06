"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  IoCallOutline,
  IoGlobeOutline,
  IoLocationOutline,
  IoStorefrontOutline,
} from "react-icons/io5";
import { FiRefreshCw } from "react-icons/fi";
import { getPublicTournamentDetailAction } from "@/actions";
import { Map, TournamentRankingPanel } from "@/components";
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
  const storePhone = store.phone?.trim() ? store.phone : "No disponible";
  const storeUrl = store.url?.trim() ? store.url : null;

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
        "error"
      );
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading, showToast, tournament]);

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

  // Tema oscuro alineado con la paleta del perfil.
  const matchCardClassNames = {
    container: "bg-gray-800/60 text-gray-200 border-gray-700/50",
    tableBadge: "bg-gray-700/70 text-gray-200",
    tableText: "text-gray-200",
    byeText: "text-gray-300",
    byeImage: "border-gray-700/50",
  };

  const historyCardClassNames = {
    container: "border-gray-700/50 bg-gray-800/60 text-gray-200",
    header: "text-gray-200",
    title: "text-gray-200",
    metaText: "text-gray-400",
    divider: "border-gray-700/50",
    tableHeader: "bg-gray-800/60",
    tableHeaderText: "text-gray-400",
    matchDivider: "border-gray-700/50",
  };

  const rankingPanelClassNames = {
    container: "bg-gray-800/60 border-gray-700/50 text-gray-200",
    title: "text-gray-200",
    pagination: "text-gray-200",
    emptyState:
      "border border-dashed border-gray-700 bg-gray-900/70 text-gray-400",
  };

  const rankingDesktopClassNames = {
    table: "text-gray-200",
    headerRow: "text-gray-400 border-gray-700/50",
    headerCell: "text-gray-400",
    row: "border-gray-700/50",
    cell: "text-gray-200",
  };

  const rankingMobileClassNames = {
    card: "bg-gray-800/60 border-gray-700/50",
    meta: "text-gray-300",
    metaSecondary: "text-gray-400",
  };

  return (
    <div className="relative min-h-screen flex items-start justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white overflow-hidden p-4 pb-14">
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/95" />

      <div className="relative z-10 w-full max-w-6xl bg-gray-900/70 border border-purple-600/40 rounded-2xl shadow-[rgba(168,85,247,0.3)] p-6 md:p-8 backdrop-blur-md flex flex-col gap-8">
        <div className="flex justify-start">
          <Link
            href="/torneos"
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/50 px-4 py-2 text-sm font-semibold text-purple-200 transition hover:border-purple-400 hover:bg-purple-500/10 hover:text-white"
          >
            Volver a torneos
          </Link>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-700/50 bg-gray-800/60 p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gray-400">
                <IoStorefrontOutline className="text-purple-300" />
                Tienda organizadora
              </div>
              <h2 className="mt-3 text-2xl md:text-3xl font-bold text-gray-100">
                {store.name}
              </h2>

              <div className="mt-4 grid gap-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <IoLocationOutline className="mt-0.5 text-purple-300" />
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">
                      Ubicacion
                    </p>
                    <p>
                      {store.city}, {store.country}
                    </p>
                    <p className="text-gray-300">{store.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IoCallOutline className="mt-0.5 text-purple-300" />
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">
                      Telefono
                    </p>
                    <p>{storePhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IoGlobeOutline className="mt-0.5 text-purple-300" />
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">
                      Sitio
                    </p>
                    {storeUrl ? (
                      <Link
                        href={storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-300 hover:text-purple-200"
                      >
                        {storeUrl}
                      </Link>
                    ) : (
                      <p>No disponible</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-700/50 bg-gray-800/60 p-3">
              {hasValidCoordinates ? (
                <Map
                  className="h-[280px] w-full rounded-lg"
                  lat={store.lat}
                  lgn={store.lgn}
                  title={store.name}
                />
              ) : (
                <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-gray-700 text-sm text-gray-400">
                  Mapa no disponible.
                </div>
              )}
            </div>
          </div>

          {tournament && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-700/50 bg-gray-800/60 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                      Torneo
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-100">
                      {tournament.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {tournament.status === "in_progress" && (
                      <button
                        type="button"
                        title="Actualizar torneo"
                        onClick={handleReload}
                        className="rounded-full p-1 text-gray-300 transition hover:bg-gray-700/60 hover:text-purple-300"
                      >
                        <FiRefreshCw className="h-4 w-4" />
                      </button>
                    )}
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        tournament.status === "in_progress"
                          ? "bg-blue-100 text-blue-700"
                          : tournament.status === "finished"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
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
                  <h3 className="text-base font-semibold text-gray-200">
                    Ronda actual
                  </h3>

                  {currentRound ? (
                    <div className="flex flex-col gap-3">
                      {currentRound.matches.map((match, index) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          tableNumber={index + 1}
                          players={players}
                          readOnly
                          decorated
                          classNames={matchCardClassNames}
                          renderResult={(item) => renderResultButtons(item)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-700 bg-gray-900/70 p-6 text-sm text-gray-400">
                      Aun no se ha generado la ronda actual.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {tournament && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200">
              Clasificacion general
            </h3>

            <TournamentRankingPanel
              players={players}
              rounds={rounds}
              status={tournament.status}
              showPodium={showPodium}
              showTitle={false}
              classNames={rankingPanelClassNames}
              desktopClassNames={rankingDesktopClassNames}
              mobileClassNames={rankingMobileClassNames}
            />
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-200">
            Historial de rondas
          </h3>

          {historyRounds.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-700 bg-gray-900/70 p-6 text-sm text-gray-400">
              Aun no se han generado rondas.
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
                    matches={round.matches}
                    readOnly
                    allowExpand={false}
                    classNames={historyCardClassNames}
                    matchCardClassNames={matchCardClassNames}
                    renderResult={(match) => renderResultButtons(match)}
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
