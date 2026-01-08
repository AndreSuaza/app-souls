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
    <div className="space-y-8">
      <div className="space-y-6">
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
                  {tournament.status === "in_progress" &&
                    onRefreshTournament && (
                      <button
                        type="button"
                        title="Actualizar torneo"
                        onClick={() => onRefreshTournament(tournament.id)}
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

                {currentRound && currentMatch ? (
                  <MatchCard
                    match={stripMatchResult(currentMatch)}
                    tableNumber={currentMatchIndex + 1}
                    players={players}
                    readOnly
                    decorated
                    renderResult={() =>
                      tournament?.status !== "finished"
                        ? renderVS()
                        : renderResultButtons(currentMatch)
                    }
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-tournament-dark-accent bg-white p-6 text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
                    {currentRound
                      ? "Aún no tienes un match asignado en la ronda actual."
                      : "Aún no se ha generado la ronda actual."}
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
            Clasificacion general
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
          <div className="rounded-lg border border-dashed border-tournament-dark-accent bg-white p-6 text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
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
  );
};
