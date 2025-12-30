"use client";

import { useEffect, useMemo } from "react";
import {
  ActiveTournamentData,
  MatchInterface,
  TournamentSnapshot,
} from "@/interfaces";
import { MatchCard } from "../tournaments/tournament/current-round/MarchCard";
import { RoundHistoryCardBase } from "../tournaments/tournament/hisotry/RoundHistoryCardBase";
import { ResultButton } from "../tournaments/tournament/current-round/ResultButton";
import { TournamentRankingPanel } from "./TournamentRankingPanel";
import { useToastStore } from "@/store";
import { FiRefreshCw } from "react-icons/fi";

const EMPTY_ROUNDS: [] = [];

type Props = {
  data: ActiveTournamentData;
  selectedTournament?: TournamentSnapshot | null;
  hasShownInProgressWarning?: boolean;
  onInProgressWarningShown?: () => void;
  onRefreshTournament?: (tournamentId: string) => void;
};

export const ProfileCurrentTournament = ({
  data,
  selectedTournament = null,
  hasShownInProgressWarning = false,
  onInProgressWarningShown,
  onRefreshTournament,
}: Props) => {
  const { currentTournament, lastTournament, currentUserId } = data;
  const displayTournament =
    selectedTournament ?? currentTournament ?? lastTournament;
  const tournament = displayTournament?.tournament ?? null;
  const players = displayTournament?.players ?? [];
  const rounds = displayTournament?.rounds ?? EMPTY_ROUNDS;
  const showToast = useToastStore((state) => state.showToast);
  const currentRound =
    rounds.length > 0 ? rounds[rounds.length - 1] : undefined;
  const currentPlayer = players.find(
    (player) => player.userId === currentUserId
  );

  // Ubica el match del usuario en la ronda actual para destacarlo primero.
  const currentMatchIndex = currentRound
    ? currentRound.matches.findIndex(
        (match) =>
          match.player1Id === currentPlayer?.id ||
          match.player2Id === currentPlayer?.id
      )
    : -1;

  const currentMatch =
    currentRound && currentMatchIndex >= 0
      ? currentRound.matches[currentMatchIndex]
      : null;

  // Coloca la ronda actual primero (si existe) y luego ordena el resto en descendente.
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
  const shouldShowWarning =
    data.inProgressCount > 1 &&
    tournament?.status === "in_progress" &&
    !hasShownInProgressWarning;

  useEffect(() => {
    if (!shouldShowWarning) return;
    showToast("Tienes mas de un torneo en progreso registrado.", "warning");
    onInProgressWarningShown?.();
  }, [onInProgressWarningShown, shouldShowWarning, showToast]);

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

  // Tema oscuro alineado con la paleta del admin.
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
    <div className="space-y-8">
      <div className="space-y-6">
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
                  {tournament.status === "in_progress" &&
                    onRefreshTournament && (
                      <button
                        type="button"
                        title="Actualizar torneo"
                        onClick={() => onRefreshTournament(tournament.id)}
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

                {currentRound && currentMatch ? (
                  <MatchCard
                    match={currentMatch}
                    tableNumber={currentMatchIndex + 1}
                    players={players}
                    readOnly
                    decorated
                    classNames={matchCardClassNames}
                    renderResult={(match) => renderResultButtons(match)}
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-700 bg-gray-900/70 p-6 text-sm text-gray-400">
                    {currentRound
                      ? "Aun no tienes un match asignado en la ronda actual."
                      : "Aun no se ha generado la ronda actual."}
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
  );
};
