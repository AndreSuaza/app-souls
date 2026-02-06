"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import {
  ActiveTournamentData,
  Deck,
  MatchInterface,
  TournamentSnapshot,
} from "@/interfaces";
import { MatchCard } from "../tournaments/tournament/current-round/MarchCard";
import { RoundHistoryCardBase } from "../tournaments/tournament/hisotry/RoundHistoryCardBase";
import { ResultButton } from "../tournaments/tournament/current-round/ResultButton";
import { TournamentRankingPanel } from "./TournamentRankingPanel";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import { associateDeckToTournamentAction } from "@/actions";
import { FiRefreshCw } from "react-icons/fi";
import { GiCardDraw } from "react-icons/gi";
import { TbCardsFilled } from "react-icons/tb";
import { Modal } from "../ui/modal/modal";
import { UserDeckLibrary } from "../mazos/deck-library/UserDeckLibrary";

const EMPTY_ROUNDS: [] = [];

type Props = {
  data: ActiveTournamentData;
  selectedTournament?: TournamentSnapshot | null;
  hasShownInProgressWarning?: boolean;
  onInProgressWarningShown?: () => void;
  onRefreshTournament?: (tournamentId: string) => void;
  enableDeckAssociation?: boolean;
  hasSession?: boolean;
};

export const ProfileCurrentTournament = ({
  data,
  selectedTournament = null,
  hasShownInProgressWarning = false,
  onInProgressWarningShown,
  onRefreshTournament,
  enableDeckAssociation = false,
  hasSession = false,
}: Props) => {
  const { currentTournament, lastTournament, currentUserId } = data;
  const displayTournament =
    selectedTournament ?? currentTournament ?? lastTournament;
  const tournament = displayTournament?.tournament ?? null;
  const players = displayTournament?.players ?? [];
  const rounds = displayTournament?.rounds ?? EMPTY_ROUNDS;
  const showToast = useToastStore((state) => state.showToast);
  const openAlertConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const currentPlayer = players.find(
    (player) => player.userId === currentUserId,
  );
  const [associatedDeckId, setAssociatedDeckId] = useState<string | null>(
    currentPlayer?.deckId ?? null,
  );
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const currentRound =
    rounds.length > 0 ? rounds[rounds.length - 1] : undefined;

  useEffect(() => {
    setAssociatedDeckId(currentPlayer?.deckId ?? null);
  }, [currentPlayer?.deckId]);

  // Ubica el match del usuario en la ronda actual para destacarlo primero.
  const currentMatchIndex = currentRound
    ? currentRound.matches.findIndex(
        (match) =>
          match.player1Id === currentPlayer?.id ||
          match.player2Id === currentPlayer?.id,
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

  const hasAssociatedDeck = Boolean(associatedDeckId);
  const canAssociateDeck =
    enableDeckAssociation &&
    hasSession &&
    Boolean(currentPlayer) &&
    tournament?.status === "finished" &&
    !hasAssociatedDeck;
  const canViewDeck =
    enableDeckAssociation && Boolean(currentPlayer) && hasAssociatedDeck;

  const handleOpenDeckModal = () => {
    setIsDeckModalOpen(true);
  };

  const handleDeckSelect = (
    deck: Deck,
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (!tournament) return;

    openAlertConfirmation({
      text: "¿Deseas asociar este mazo al torneo?",
      description:
        "Se duplicará el mazo seleccionado y quedará asociado a este torneo.",
      action: async () => {
        showLoading("Asociando mazo...");
        try {
          const result = await associateDeckToTournamentAction({
            tournamentId: tournament.id,
            deckId: deck.id,
          });
          setAssociatedDeckId(result.deckId);
          setIsDeckModalOpen(false);
          showToast("Mazo asociado correctamente.", "success");
          return true;
        } catch (error) {
          showToast(
            error instanceof Error
              ? error.message
              : "No se pudo asociar el mazo.",
            "error",
          );
          return false;
        } finally {
          hideLoading();
        }
      },
    });
  };

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
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                      Torneo
                    </p>
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
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    {tournament.title}
                  </h2>
                </div>
                <div className="flex items-end gap-2">
                  {canAssociateDeck && (
                    <button
                      type="button"
                      title="Asociar mazo"
                      aria-label="Asociar mazo"
                      onClick={handleOpenDeckModal}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-yellow-300 bg-yellow-400 px-3 text-xs font-semibold leading-none text-slate-900 shadow-sm transition hover:bg-yellow-300 dark:border-yellow-300 dark:bg-yellow-400 dark:text-slate-900 dark:hover:bg-yellow-300"
                    >
                      <GiCardDraw className="h-5 w-5" />
                      Asociar mazo
                    </button>
                  )}
                  {canViewDeck && associatedDeckId && (
                    <Link
                      href={`/laboratorio?id=${associatedDeckId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-yellow-300 bg-yellow-400 px-3 text-xs font-semibold leading-none text-slate-900 shadow-sm transition hover:bg-yellow-300 dark:border-yellow-300 dark:bg-yellow-400 dark:text-slate-900 dark:hover:bg-yellow-300"
                    >
                      <TbCardsFilled className="h-5 w-5" />
                      Ver mazo
                    </Link>
                  )}
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

      {isDeckModalOpen && (
        <Modal
          className="left-1/2 top-1/2 w-[94%] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white shadow-2xl transition-all dark:border-tournament-dark-border dark:bg-tournament-dark-surface overflow-hidden"
          close={() => setIsDeckModalOpen(false)}
        >
          <div className="flex max-h-[80vh] w-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white sm:text-2xl">
                Mis mazos
              </h1>
            </div>
            <div className="overflow-auto px-5 pb-6 pt-5">
              <UserDeckLibrary
                archetypes={[]}
                hasSession={hasSession}
                onSelect={handleDeckSelect}
                minCardsNumber={40}
                tournamentFilter="all"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
