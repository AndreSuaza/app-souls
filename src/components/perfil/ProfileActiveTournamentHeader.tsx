"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GiCardDraw } from "react-icons/gi";
import { IoTrophyOutline } from "react-icons/io5";
import { associateDeckToTournamentAction } from "@/actions";
import type { Deck, TournamentSnapshot } from "@/interfaces";
import { useToastStore, useUIStore } from "@/store";
import { getAvatarUrl } from "@/utils/avatar-image";
import { UserDeckLibrary } from "../mazos/deck-library/UserDeckLibrary";
import { MatchCard } from "../tournaments/tournament/current-round/MarchCard";
import { Modal } from "../ui/modal/modal";
import { TournamentDeckConfirmModal } from "./TournamentDeckConfirmModal";

type Props = {
  tournamentSnapshot: TournamentSnapshot;
  currentUserId: string;
  hasSession: boolean;
};

type TournamentPlayer = TournamentSnapshot["players"][number];

const getPlayerById = (
  playerId: string | null,
  players: TournamentSnapshot["players"],
) => {
  if (!playerId) return null;
  return players.find((item) => item.id === playerId) ?? null;
};

const MatchPlayerRow = ({
  player,
  fallback = "BYE",
}: {
  player: TournamentPlayer | null;
  fallback?: string;
}) => (
  <div className="box-border flex w-full min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-xl border border-purple-200/80 px-2 py-2 dark:border-purple-500/25">
    <Image
      src={getAvatarUrl(player?.image)}
      alt={player?.playerNickname ?? fallback}
      title={player?.playerNickname ?? fallback}
      width={32}
      height={32}
      className="h-8 w-8 shrink-0 rounded-full border-2 border-purple-200 object-cover dark:border-purple-500/40"
    />
    <div className="min-w-0 max-w-full flex-1 overflow-hidden leading-tight">
      <p className="w-full max-w-full truncate text-xs font-black text-slate-950 dark:text-white">
        {player?.playerNickname ?? fallback}
      </p>
      <p className="w-full max-w-full truncate text-[10px] text-slate-500 dark:text-slate-400">
        {player
          ? `${player.name || "Jugador"} ${player.lastname ?? ""}`
          : "Descanso"}
      </p>
    </div>
  </div>
);

export const ProfileActiveTournamentHeader = ({
  tournamentSnapshot,
  currentUserId,
  hasSession,
}: Props) => {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const { tournament, players, rounds } = tournamentSnapshot;
  const currentPlayer = players.find(
    (player) => player.userId === currentUserId,
  );
  const [associatedDeckId, setAssociatedDeckId] = useState<string | null>(
    currentPlayer?.deckId ?? null,
  );
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [isDeckConfirmModalOpen, setIsDeckConfirmModalOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const currentRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;
  const currentMatch =
    tournament.status === "in_progress" && currentPlayer && currentRound
      ? currentRound.matches.find(
          (match) =>
            match.player1Id === currentPlayer.id ||
            match.player2Id === currentPlayer.id,
        )
      : null;
  const currentMatchIndex =
    currentRound && currentMatch
      ? currentRound.matches.findIndex((match) => match.id === currentMatch.id)
      : -1;
  const currentMatchPlayer1 = currentMatch
    ? getPlayerById(currentMatch.player1Id, players)
    : null;
  const currentMatchPlayer2 = currentMatch
    ? getPlayerById(currentMatch.player2Id, players)
    : null;
  const canAssociateDeck =
    hasSession &&
    tournament.status === "pending" &&
    Boolean(currentPlayer) &&
    !associatedDeckId;

  useEffect(() => {
    setAssociatedDeckId(currentPlayer?.deckId ?? null);
  }, [currentPlayer?.deckId]);

  const openTournament = () => {
    router.push(`/torneos/${tournament.id}`);
  };

  const handleOpenDeckModal = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsDeckModalOpen(true);
  };

  const handleAssociateDeck = async (deckId: string) => {
    showLoading("Asociando mazo...");

    try {
      const result = await associateDeckToTournamentAction({
        tournamentId: tournament.id,
        deckId,
      });
      setAssociatedDeckId(result.deckId);
      setIsDeckModalOpen(false);
      setIsDeckConfirmModalOpen(false);
      setSelectedDeck(null);
      showToast("Mazo asociado correctamente.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "No se pudo asociar el mazo.",
        "error",
      );
    } finally {
      hideLoading();
    }
  };

  const handleDeckSelect = (
    deck: Deck,
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedDeck(deck);
    setIsDeckModalOpen(false);
    setIsDeckConfirmModalOpen(true);
  };

  const renderDesktopVS = () => (
    <div className="hidden w-full items-center justify-center md:flex">
      <span className="text-xs font-black text-slate-400 dark:text-slate-500">
        VS
      </span>
    </div>
  );

  return (
    <>
      <div className="w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-purple-300 bg-gradient-to-br from-purple-100 via-white to-amber-50 px-3 py-5 shadow-lg dark:border-purple-500/50 dark:from-tournament-dark-surface dark:via-tournament-dark-surface/80 dark:to-purple-950/30 sm:p-5">
        <div className="grid w-full min-w-0 max-w-full gap-4">
          <div className="flex w-full min-w-0 max-w-full flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="w-full min-w-0 max-w-full">
              <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-700 dark:text-purple-300">
                  Torneo activo
                </p>
                <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-800 dark:border-amber-400/40 dark:bg-amber-400/15 dark:text-amber-100">
                  {tournament.typeTournamentName}
                </span>
              </div>
              <h2 className="mt-2 w-full max-w-full truncate text-2xl font-semibold text-slate-950 dark:text-white">
                {tournament.title}
              </h2>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              {canAssociateDeck && (
                <button
                  type="button"
                  onClick={handleOpenDeckModal}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-yellow-300 bg-yellow-400 px-4 text-sm font-black text-slate-950 shadow-sm transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                >
                  <GiCardDraw className="h-5 w-5" />
                  Asociar mazo
                </button>
              )}
              <button
                type="button"
                onClick={openTournament}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-purple-500/40 bg-purple-950/40 px-4 text-sm font-bold uppercase tracking-wide text-white transition hover:border-yellow-400 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <IoTrophyOutline className="h-5 w-5" />
                Ver torneo
              </button>
            </div>
          </div>

          {tournament.status === "in_progress" &&
          currentRound &&
          currentMatch &&
          currentMatchPlayer1 ? (
            <>
              <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-purple-200 bg-white/75 p-2 shadow-sm dark:border-purple-500/30 dark:bg-tournament-dark-muted/70 sm:hidden">
                <div className="flex min-w-0 items-center justify-between gap-2 px-1">
                  <span className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Ronda {currentRound.roundNumber}
                  </span>
                  <span className="shrink-0 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-black text-purple-800 dark:border-purple-500/30 dark:bg-purple-500/15 dark:text-purple-100">
                    Mesa {currentMatchIndex >= 0 ? currentMatchIndex + 1 : 1}
                  </span>
                </div>

                <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-1.5">
                  <MatchPlayerRow player={currentMatchPlayer1} />

                  <div className="flex min-w-0 items-center gap-2 px-2">
                    <span className="h-px min-w-0 flex-1 bg-purple-200 dark:bg-purple-500/25" />
                    <span className="shrink-0 rounded-full bg-purple-950 px-2 py-0.5 text-[9px] font-black text-white dark:bg-purple-500/25 dark:text-purple-100">
                      VS
                    </span>
                    <span className="h-px min-w-0 flex-1 bg-purple-200 dark:bg-purple-500/25" />
                  </div>

                  <MatchPlayerRow player={currentMatchPlayer2} />
                </div>
              </div>

              <div className="hidden sm:block">
                <MatchCard
                  match={currentMatch}
                  tableNumber={
                    currentMatchIndex >= 0 ? currentMatchIndex + 1 : 1
                  }
                  players={players}
                  readOnly
                  decorated
                  renderResult={renderDesktopVS}
                  classNames={{
                    container:
                      "border-purple-200 bg-white/75 text-slate-950 dark:border-purple-500/30 dark:bg-tournament-dark-muted/70 dark:text-slate-200 px-1 py-2 gap-y-1 md:grid-cols-[38px_minmax(0,1fr)_34px_minmax(0,1fr)_24px] md:px-2 md:py-2 md:gap-2",
                    tableBadge:
                      "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-100",
                    tableText:
                      "text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500",
                    byeText: "text-slate-400 dark:text-slate-500",
                    byeImage: "border-purple-200 dark:border-purple-500/40",
                  }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {tournament.status === "in_progress"
                ? "Ronda actual pendiente de asignacion."
                : associatedDeckId
                  ? "Mazo asociado. Pulsa para ver el torneo."
                  : "Torneo pendiente. Asocia tu mazo antes de iniciar."}
            </p>
          )}
        </div>
      </div>

      {isDeckModalOpen && (
        <Modal
          className="left-1/2 top-1/2 w-[94%] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl transition-all dark:border-tournament-dark-border dark:bg-tournament-dark-surface"
          close={() => setIsDeckModalOpen(false)}
        >
          <div className="flex max-h-[80vh] w-full flex-col overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
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

      {isDeckConfirmModalOpen && selectedDeck && (
        <TournamentDeckConfirmModal
          deck={selectedDeck}
          hasSession={hasSession}
          onConfirm={() => handleAssociateDeck(selectedDeck.id)}
          onChangeDeck={() => {
            setIsDeckConfirmModalOpen(false);
            setSelectedDeck(null);
            setIsDeckModalOpen(true);
          }}
          onClose={() => {
            setIsDeckConfirmModalOpen(false);
            setSelectedDeck(null);
          }}
        />
      )}
    </>
  );
};
