"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { FiMaximize2 } from "react-icons/fi";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  MatchInterface,
  RoundInterface,
  RoundStage,
  TournamentPlayerInterface,
} from "@/interfaces";
import {
  getBracketChampionId,
  getEliminationStageForBracketSize,
  getEliminationStageTitle,
  getRoundStageLabel,
  isEliminationStage,
} from "@/logic";
import { Modal } from "@/components/ui/modal/modal";

type Props = {
  rounds: RoundInterface[];
  players: TournamentPlayerInterface[];
  compact?: boolean;
  bracketType?: "topCut" | "elimination";
  editable?: boolean;
  onReorder?: (
    roundId: string,
    layoutRevision: number,
    matches: { id: string; player1Id: string; player2Id: string | null }[],
  ) => Promise<void>;
};

type BracketStageDefinition = {
  stage: RoundStage;
  title: string;
  positions: number[];
  bracketSize?: number;
};

type BracketColumnDefinition = BracketStageDefinition & {
  side: "left" | "center" | "right";
};

const getStages = (
  bracketType: "topCut" | "elimination",
  rounds: RoundInterface[],
) => {
  if (bracketType === "topCut") {
    return [
      {
        stage: "TOP8_QUARTERFINAL",
        title: "Cuartos",
        positions: [1, 2, 3, 4],
      },
      { stage: "TOP8_SEMIFINAL", title: "Semifinal", positions: [1, 2] },
      { stage: "TOP8_FINAL", title: "Final", positions: [1] },
    ] as BracketStageDefinition[];
  }

  const initialRound = rounds.find((round) => isEliminationStage(round.stage));
  if (!initialRound) return [];

  const initialBracketSize =
    initialRound.bracketSize ?? initialRound.matches.length * 2;
  const hasPlayIn = initialRound.stage === "ELIMINATION_PLAY_IN";
  const stages: BracketStageDefinition[] = [];

  if (hasPlayIn) {
    stages.push({
      stage: "ELIMINATION_PLAY_IN",
      title: "Ronda preliminar",
      positions: Array.from(
        { length: initialBracketSize / 2 },
        (_, index) => index + 1,
      ),
      bracketSize: initialBracketSize,
    });
  }

  for (
    let bracketSize = hasPlayIn ? initialBracketSize / 2 : initialBracketSize;
    bracketSize >= 2;
    bracketSize /= 2
  ) {
    const stage = getEliminationStageForBracketSize(bracketSize);
    stages.push({
      stage,
      title: getEliminationStageTitle(stage, bracketSize),
      positions: Array.from(
        { length: bracketSize / 2 },
        (_, index) => index + 1,
      ),
      bracketSize,
    });
  }

  return stages;
};

const getBracketColumns = (
  stages: BracketStageDefinition[],
): BracketColumnDefinition[] => {
  if (stages.length === 0) return [];

  const finalStage = stages[stages.length - 1];
  const nonFinalStages = stages.slice(0, -1);
  const leftStages = nonFinalStages.map((stage) => ({
    ...stage,
    side: "left" as const,
    positions: stage.positions.slice(0, Math.ceil(stage.positions.length / 2)),
  }));
  const rightStages = [...nonFinalStages]
    .reverse()
    .map((stage) => ({
      ...stage,
      side: "right" as const,
      positions: stage.positions.slice(Math.ceil(stage.positions.length / 2)),
    }));

  return [
    ...leftStages,
    { ...finalStage, side: "center" as const },
    ...rightStages,
  ];
};

type PlayerDisplay = {
  id: string | null;
  nickname: string;
  isPlaceholder: boolean;
  profileHref: string | null;
};

const getPlayerDisplay = (
  playerId: string | null,
  players: TournamentPlayerInterface[],
  fallback: string,
) => {
  if (!playerId) {
    return {
      id: null,
      nickname: fallback,
      isPlaceholder: true,
      profileHref: null,
    };
  }

  const player = players.find((item) => item.id === playerId);
  if (!player) {
    return {
      id: null,
      nickname: fallback,
      isPlaceholder: true,
      profileHref: null,
    };
  }

  return {
    id: player.id,
    nickname: player.playerNickname,
    isPlaceholder: false,
    profileHref: `/perfil/${encodeURIComponent(player.playerNickname)}`,
  };
};

type BracketPlayerSlotProps = {
  matchId?: string;
  slot: "player1" | "player2";
  player: PlayerDisplay;
  hasWon: boolean;
  winnerVariant: "p1" | "p2";
  editable: boolean;
};

const BracketPlayerSlot = ({
  matchId,
  slot,
  player,
  hasWon,
  winnerVariant,
  editable,
}: BracketPlayerSlotProps) => {
  const slotId = `${matchId ?? "placeholder"}:${slot}`;
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: slotId,
    disabled: !editable || !matchId,
    data: { matchId, slot },
  });
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: slotId,
    disabled: !editable || !matchId || player.isPlaceholder,
    data: { matchId, slot, playerId: player.id },
  });

  return (
    <div
      className={clsx(
        "relative flex min-w-0 h-1/2 items-center gap-3 px-3 pl-4 text-sm font-semibold transition-colors",
        hasWon && winnerVariant === "p1"
          ? "bg-blue-50 text-blue-900 dark:bg-blue-500/15 dark:text-blue-100"
          : hasWon && winnerVariant === "p2"
            ? "bg-rose-50 text-rose-900 dark:bg-rose-500/15 dark:text-rose-100"
            : player.isPlaceholder
              ? "bg-slate-100 text-slate-500 dark:bg-tournament-dark-muted/70 dark:text-slate-400"
              : "bg-slate-50 text-slate-800 dark:bg-tournament-dark-muted/60 dark:text-slate-200",
        editable && !player.isPlaceholder && "touch-none cursor-grab active:cursor-grabbing",
        isOver && editable && "ring-2 ring-inset ring-amber-400",
        isDragging && "z-20 opacity-40",
      )}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      {...(editable && !player.isPlaceholder ? attributes : {})}
      {...(editable && !player.isPlaceholder ? listeners : {})}
      ref={(node) => {
        setDropRef(node);
        if (editable && !player.isPlaceholder) setDragRef(node);
      }}
      title={editable && !player.isPlaceholder ? "Arrastra para intercambiar de posición" : undefined}
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
      {player.profileHref ? (
        <Link
          href={player.profileHref}
          target="_blank"
          rel="noopener noreferrer"
          title={`Ver perfil de ${player.nickname}`}
          className="block min-w-0 flex-1 truncate transition hover:text-purple-600 dark:hover:text-purple-200"
        >
          {player.nickname}
        </Link>
      ) : (
        <span className="min-w-0 flex-1 truncate">{player.nickname}</span>
      )}
    </div>
  );
};

const getMatchByPosition = (
  round: RoundInterface | undefined,
  position: number,
) =>
  round?.matches.find(
    (match, index) => (match.bracketPosition ?? index + 1) === position,
  );

const getPlaceholder = (
  stage: RoundInterface["stage"],
  position: number,
  bracketSize?: number,
) => {
  if (stage === "ELIMINATION_QUARTERFINAL") {
    return `Ganador R16 ${position * 2 - 1}/${position * 2}`;
  }

  if (stage === "ELIMINATION_ROUND" && bracketSize) {
    return `Ganador Ronda de ${bracketSize * 2} ${position * 2 - 1}/${position * 2}`;
  }

  if (stage === "TOP8_SEMIFINAL" || stage === "ELIMINATION_SEMIFINAL") {
    return position === 1 ? "Ganador CF 1/2" : "Ganador CF 3/4";
  }

  if (stage === "TOP8_FINAL" || stage === "ELIMINATION_FINAL") {
    return "Ganador semifinal";
  }

  return "Pendiente";
};

const TopCutMatch = ({
  match,
  players,
  placeholder,
  compact,
  editable = false,
}: {
  match?: MatchInterface;
  players: TournamentPlayerInterface[];
  placeholder: string;
  compact?: boolean;
  editable?: boolean;
}) => {
  const player1Display = getPlayerDisplay(
    match?.player1Id ?? null,
    players,
    placeholder,
  );
  const player2Display = getPlayerDisplay(
    match?.player2Id ?? null,
    players,
    match?.player2Nickname === "BYE" ? "BYE" : placeholder,
  );

  const player1Won = match?.result === "P1";
  const player2Won = match?.result === "P2";
  const isPending = !match;

  return (
    <div
      className={clsx(
        "relative w-full overflow-hidden rounded-lg border shadow-sm",
        isPending
          ? "border-dashed border-slate-300 bg-slate-100/70 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/40"
          : "border-purple-200 bg-purple-50/70 dark:border-purple-500/25 dark:bg-purple-500/10",
      )}
    >
      <div
        className={clsx(
          "grid grid-cols-[minmax(0,1fr)_44px] text-sm",
          compact ? "min-h-[74px]" : "min-h-[92px]",
        )}
      >
        <div className="divide-y divide-slate-200 dark:divide-tournament-dark-border">
          <BracketPlayerSlot
            matchId={match?.id}
            slot="player1"
            player={player1Display}
            hasWon={player1Won}
            winnerVariant="p1"
            editable={editable && !!match}
          />
          <BracketPlayerSlot
            matchId={match?.id}
            slot="player2"
            player={player2Display}
            hasWon={player2Won}
            winnerVariant="p2"
            editable={editable && !!match}
          />
        </div>

        <div className="flex w-[44px] min-w-[44px] max-w-[44px] flex-col divide-y divide-slate-800 bg-slate-950 text-center text-sm font-bold text-white">
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
  bracketType = "topCut",
  editable = false,
  onReorder,
}: Props) => {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const stages = getStages(bracketType, rounds);
  const bracketColumns = getBracketColumns(stages).map((stage) => ({
    ...stage,
    round: rounds.find(
      (round) =>
        round.stage === stage.stage &&
        (round.bracketSize === stage.bracketSize || !round.bracketSize),
    ),
  }));
  const hasBracket = bracketColumns.some((stage) => stage.round);
  const initialEliminationRound = rounds.find((round) =>
    isEliminationStage(round.stage),
  );
  const needsDesktopHorizontalScroll =
    bracketType === "elimination" &&
    (initialEliminationRound?.bracketSize ?? 0) >= 64;
  const bracketMinWidthClass = needsDesktopHorizontalScroll
    ? "min-w-[1800px]"
    : bracketColumns.length >= 7
      ? "min-w-[640px] sm:min-w-[1180px]"
      : "min-w-[640px] sm:min-w-[820px]";
  const leafMatchCount = Math.max(
    1,
    Math.ceil((stages[0]?.positions.length ?? 1) / 2),
  );
  const matchHeight = compact ? 74 : 92;
  const matchGap = 12;
  const championId = getBracketChampionId(rounds, bracketType);
  const champion = championId
    ? players.find((player) => player.id === championId)
    : null;
  const editableRound =
    bracketType === "elimination" && editable
      ? rounds[rounds.length - 1]
      : undefined;
  const canEdit = Boolean(
    onReorder &&
      editableRound &&
      !editableRound.startedAt &&
      !editableRound.finishedAt &&
      saveStatus !== "saving",
  );

  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!canEdit || !onReorder || !editableRound || !over || active.id === over.id) return;

    const source = active.data.current as
      | { matchId?: string; slot?: "player1" | "player2" }
      | undefined;
    const target = over.data.current as
      | { matchId?: string; slot?: "player1" | "player2" }
      | undefined;

    if (
      !source?.matchId ||
      !source.slot ||
      !target?.matchId ||
      !target.slot
    ) {
      return;
    }

    const sourceMatch = editableRound.matches.find(
      (match) => match.id === source.matchId,
    );
    const targetMatch = editableRound.matches.find(
      (match) => match.id === target.matchId,
    );
    if (!sourceMatch || !targetMatch) return;

    const getSlotPlayer = (match: MatchInterface, slot: "player1" | "player2") =>
      slot === "player1" ? match.player1Id : match.player2Id;
    const sourcePlayerId = getSlotPlayer(sourceMatch, source.slot);
    const targetPlayerId = getSlotPlayer(targetMatch, target.slot);
    if (!sourcePlayerId) return;

    const nextMatches = editableRound.matches.map((match) => ({
      id: match.id,
      player1Id: match.player1Id,
      player2Id: match.player2Id,
    }));
    const nextSource = nextMatches.find((match) => match.id === source.matchId)!;
    const nextTarget = nextMatches.find((match) => match.id === target.matchId)!;
    const setSlotPlayer = (
      match: (typeof nextMatches)[number],
      slot: "player1" | "player2",
      playerId: string | null,
    ) => {
      if (slot === "player1") match.player1Id = playerId as string;
      else match.player2Id = playerId;
    };

    setSlotPlayer(nextSource, source.slot, targetPlayerId);
    setSlotPlayer(nextTarget, target.slot, sourcePlayerId);

    for (const match of [nextSource, nextTarget]) {
      if (!match.player1Id && match.player2Id) {
        match.player1Id = match.player2Id;
        match.player2Id = null;
      }
    }

    setSaveStatus("saving");
    try {
      await onReorder(
        editableRound.id,
        editableRound.layoutRevision ?? 0,
        nextMatches,
      );
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  };

  if (!hasBracket) {
    return (
      <section className="min-w-0 max-w-full rounded-xl border border-dashed border-tournament-dark-accent bg-white p-5 text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
        {bracketType === "elimination"
          ? "El bracket de eliminación se habilitará cuando el admin lo genere."
          : "El bracket Top 8 se habilitara cuando finalice la última ronda suiza."}
      </section>
    );
  }

  const bracketContent = (fullscreen = false) => (
    <section
      className={clsx(
        "w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-tournament-dark-accent bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface sm:p-5",
        fullscreen && "flex h-full flex-col",
      )}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600 dark:text-amber-300">
            {bracketType === "elimination" ? "Eliminación directa" : "Top 8"}
          </p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {bracketType === "elimination"
              ? "Bracket de eliminación"
              : "Bracket eliminatorio"}
          </h3>
        </div>
        {canEdit && saveStatus !== "idle" && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-300">
              {saveStatus === "saving" && "Guardando bracket..."}
              {saveStatus === "saved" && "Bracket guardado"}
              {saveStatus === "error" && "No se pudo guardar; revisa el bracket"}
            </span>
          </div>
        )}
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2 text-xs font-semibold text-slate-500 dark:text-slate-300">
          {champion && (
            <Link
              href={`/perfil/${encodeURIComponent(champion.playerNickname)}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`Ver perfil de ${champion.playerNickname}`}
              className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-emerald-700 transition hover:border-purple-300 hover:text-purple-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-purple-300 dark:hover:text-purple-200"
            >
              Campeón: {champion.playerNickname}
            </Link>
          )}
          {!fullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              title="Ver bracket en pantalla completa"
              aria-label="Ver bracket en pantalla completa"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-purple-300 bg-purple-50 px-3 text-purple-700 transition hover:border-purple-500 hover:bg-purple-100 dark:border-purple-400/40 dark:bg-purple-500/10 dark:text-purple-100 dark:hover:bg-purple-500/20"
            >
              <FiMaximize2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div
        className={clsx(
          "w-full min-w-0 max-w-full overscroll-x-contain pb-2",
          fullscreen ? "min-h-0 flex-1 overflow-auto" : "overflow-x-auto",
        )}
      >
        <div
          className={clsx(
            "inline-grid w-max items-center gap-4 align-middle",
            bracketMinWidthClass,
            !needsDesktopHorizontalScroll && !fullscreen && "lg:w-full lg:min-w-0",
            fullscreen && !needsDesktopHorizontalScroll && "w-full min-w-0",
          )}
          style={{
            gridTemplateColumns: `repeat(${Math.max(bracketColumns.length, 1)}, minmax(0, 1fr))`,
          }}
        >
          {bracketColumns.map(
            ({ stage, title, positions, bracketSize, round, side }) => {
              const matchSpan = Math.max(
                1,
                Math.round(leafMatchCount / positions.length),
              );

              return (
            <div
                  key={`${side}-${stage}-${bracketSize ?? "top"}`}
                  className="min-w-0 space-y-3 overflow-visible"
            >
              <div className="flex items-center justify-center gap-2">
                <h4
                  className={clsx(
                    "truncate text-center text-sm font-semibold",
                    round?.id === rounds[rounds.length - 1]?.id
                      ? "text-amber-500 dark:text-amber-300"
                      : "text-purple-700 dark:text-purple-200",
                  )}
                >
                  {round && isEliminationStage(round.stage)
                    ? getEliminationStageTitle(round.stage, round.bracketSize)
                    : round
                      ? getRoundStageLabel(round.stage, round.bracketSize)
                      : title}
                </h4>
              </div>

              <div
                className="grid overflow-visible"
                style={{
                  gridTemplateRows: `repeat(${leafMatchCount}, ${matchHeight}px)`,
                  rowGap: `${matchGap}px`,
                }}
              >
                {positions.map((position, index) => {
                  const isPairStart = index % 2 === 0;

                  return (
                    <div
                      key={`${stage}-${position}`}
                      className="relative flex min-w-0 items-center justify-center overflow-visible"
                      style={{
                        gridRow: `${index * matchSpan + 1} / span ${matchSpan}`,
                      }}
                    >
                      <TopCutMatch
                        match={getMatchByPosition(round, position)}
                        players={players}
                        placeholder={getPlaceholder(stage, position, bracketSize)}
                        compact={compact}
                        editable={canEdit && round?.id === editableRound?.id}
                      />

                      {side !== "center" && (
                        <span
                          aria-hidden="true"
                          className={clsx(
                            "absolute top-1/2 h-px w-4 bg-purple-300/80 dark:bg-purple-300/70",
                            side === "left" ? "-right-4" : "-left-4",
                          )}
                        />
                      )}

                      {side !== "center" && positions.length > 1 && isPairStart && (
                        <span
                          aria-hidden="true"
                          className={clsx(
                            "absolute top-1/2 h-[calc(100%+12px)] w-px bg-purple-300/80 dark:bg-purple-300/70",
                            side === "left" ? "-right-4" : "-left-4",
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
              );
            },
          )}
        </div>
      </div>
    </section>
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {!isFullscreen && bracketContent()}
      {isFullscreen && (
        <Modal
          close={() => setIsFullscreen(false)}
          className="inset-3 flex h-[calc(100vh-1.5rem)] w-[calc(100vw-1.5rem)] items-center justify-center overflow-hidden rounded-xl bg-slate-950/95 sm:inset-6 sm:h-[calc(100vh-3rem)] sm:w-[calc(100vw-3rem)]"
        >
          {bracketContent(true)}
        </Modal>
      )}
    </DndContext>
  );
};
