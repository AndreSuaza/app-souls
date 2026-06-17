"use client";

import clsx from "clsx";
import {
  MatchInterface,
  RoundInterface,
  TournamentPlayerInterface,
} from "@/interfaces";
import {
  getRoundStageLabel,
  getTopCutChampionId,
} from "@/logic";

type Props = {
  rounds: RoundInterface[];
  players: TournamentPlayerInterface[];
  compact?: boolean;
};

const STAGES = [
  { stage: "TOP8_QUARTERFINAL", title: "Cuartos", positions: [1, 2, 3, 4] },
  { stage: "TOP8_SEMIFINAL", title: "Semifinal", positions: [1, 2] },
  { stage: "TOP8_FINAL", title: "Final", positions: [1] },
] as const;

type PlayerDisplay = {
  nickname: string;
  seed: number | null;
  isPlaceholder: boolean;
};

const getPlayerDisplay = (
  playerId: string | null,
  players: TournamentPlayerInterface[],
  fallback: string,
) => {
  if (!playerId) {
    return { nickname: fallback, seed: null, isPlaceholder: true };
  }

  const player = players.find((item) => item.id === playerId);
  if (!player) {
    return { nickname: fallback, seed: null, isPlaceholder: true };
  }

  return {
    nickname: player.playerNickname,
    seed: player.topCutSeed ?? null,
    isPlaceholder: false,
  };
};

const getMatchByPosition = (
  round: RoundInterface | undefined,
  position: number,
) =>
  round?.matches.find(
    (match, index) => (match.bracketPosition ?? index + 1) === position,
  );

const getPlaceholder = (stage: RoundInterface["stage"], position: number) => {
  if (stage === "TOP8_SEMIFINAL") {
    return position === 1 ? "Ganador CF 1/2" : "Ganador CF 3/4";
  }

  if (stage === "TOP8_FINAL") return "Ganador semifinal";

  return "Pendiente";
};

const TopCutMatch = ({
  match,
  players,
  placeholder,
  compact,
}: {
  match?: MatchInterface;
  players: TournamentPlayerInterface[];
  placeholder: string;
  compact?: boolean;
}) => {
  const player1Display = getPlayerDisplay(
    match?.player1Id ?? null,
    players,
    placeholder,
  );
  const player2Display = getPlayerDisplay(
    match?.player2Id ?? null,
    players,
    placeholder,
  );

  const player1Won = match?.result === "P1";
  const player2Won = match?.result === "P2";
  const isPending = !match;

  const renderPlayer = (
    player: PlayerDisplay,
    hasWon: boolean,
    winnerVariant: "p1" | "p2",
  ) => (
    <div
      className={clsx(
        "relative flex h-1/2 items-center gap-3 px-3 pl-4 text-sm font-semibold transition-colors",
        hasWon && winnerVariant === "p1"
          ? "bg-blue-50 text-blue-900 dark:bg-blue-500/15 dark:text-blue-100"
          : hasWon && winnerVariant === "p2"
            ? "bg-rose-50 text-rose-900 dark:bg-rose-500/15 dark:text-rose-100"
            : player.isPlaceholder
              ? "bg-slate-100 text-slate-500 dark:bg-tournament-dark-muted/70 dark:text-slate-400"
              : "bg-slate-50 text-slate-800 dark:bg-tournament-dark-muted/60 dark:text-slate-200",
      )}
    >
      <span
        className={clsx(
          "absolute inset-y-0 left-0 w-1",
          hasWon && winnerVariant === "p1"
            ? "bg-blue-500 dark:bg-blue-400"
            : hasWon && winnerVariant === "p2"
              ? "bg-rose-500 dark:bg-rose-400"
              : "bg-transparent",
        )}
        aria-hidden="true"
      />
      {player.seed ? (
        <span
          className={clsx(
            "inline-flex h-7 min-w-9 shrink-0 items-center justify-center rounded-md border px-2 text-xs font-bold",
            hasWon && winnerVariant === "p1"
              ? "border-blue-300 bg-white text-blue-700 dark:border-blue-400/50 dark:bg-blue-950/40 dark:text-blue-100"
              : hasWon && winnerVariant === "p2"
                ? "border-rose-300 bg-white text-rose-700 dark:border-rose-400/50 dark:bg-rose-950/40 dark:text-rose-100"
                : "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-400/30 dark:bg-purple-500/15 dark:text-purple-100",
          )}
        >
          #{player.seed}
        </span>
      ) : (
        <span className="h-7 min-w-9 shrink-0" />
      )}
      <span className="truncate">{player.nickname}</span>
    </div>
  );

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-lg border shadow-sm",
        isPending
          ? "border-dashed border-slate-300 bg-slate-100/70 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/40"
          : "border-purple-200 bg-purple-50/70 dark:border-purple-500/25 dark:bg-purple-500/10",
      )}
    >
      <div
        className={clsx(
          "grid grid-cols-[1fr_44px] text-sm",
          compact ? "min-h-[74px]" : "min-h-[92px]",
        )}
      >
        <div className="divide-y divide-slate-200 dark:divide-tournament-dark-border">
          {renderPlayer(player1Display, player1Won, "p1")}
          {renderPlayer(player2Display, player2Won, "p2")}
        </div>

        <div className="flex flex-col divide-y divide-slate-800 bg-slate-950 text-center text-sm font-bold text-white">
          <div className="flex h-1/2 items-center justify-center">
            {match?.result ? (player1Won ? "1" : "0") : "-"}
          </div>
          <div className="flex h-1/2 items-center justify-center">
            {match?.result ? (player2Won ? "1" : "0") : "-"}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TopCutBracket = ({
  rounds,
  players,
  compact = false,
}: Props) => {
  const bracketRounds = STAGES.map((stage) => ({
    ...stage,
    round: rounds.find((round) => round.stage === stage.stage),
  }));
  const hasBracket = bracketRounds.some((stage) => stage.round);
  const championId = getTopCutChampionId(rounds);
  const champion = championId
    ? players.find((player) => player.id === championId)
    : null;

  if (!hasBracket) {
    return (
      <section className="min-w-0 max-w-full rounded-xl border border-dashed border-tournament-dark-accent bg-white p-5 text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
        El bracket Top 8 se habilitara cuando finalice la última ronda suiza.
      </section>
    );
  }

  return (
    <section className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-tournament-dark-accent bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600 dark:text-amber-300">
            Top 8
          </p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Bracket eliminatorio
          </h3>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500 dark:text-slate-300">
          {champion && (
            <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
              Campeón: {champion.playerNickname}
            </span>
          )}
        </div>
      </div>

      <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain pb-2">
        <div className="inline-grid min-w-[820px] grid-cols-3 items-center gap-4 align-middle lg:w-full lg:min-w-0">
          {bracketRounds.map(({ stage, title, positions, round }) => (
            <div
              key={stage}
              className={clsx(
                "min-w-0 space-y-3",
                stage !== "TOP8_QUARTERFINAL" && "self-center",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="truncate text-sm font-semibold text-purple-700 dark:text-purple-200">
                  {round ? getRoundStageLabel(round.stage) : title}
                </h4>
                {round?.startedAt && !round.finishedAt && (
                  <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
                    En juego
                  </span>
                )}
              </div>

              <div
                className={clsx(
                  "grid gap-3",
                  stage === "TOP8_SEMIFINAL" && "gap-12",
                  stage === "TOP8_FINAL" && "gap-20",
                )}
              >
                {positions.map((position) => (
                  <TopCutMatch
                    key={`${stage}-${position}`}
                    match={getMatchByPosition(round, position)}
                    players={players}
                    placeholder={getPlaceholder(stage, position)}
                    compact={compact}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
