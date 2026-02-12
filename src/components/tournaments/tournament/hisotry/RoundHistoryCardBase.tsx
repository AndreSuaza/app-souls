"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import type { ReactNode } from "react";
import {
  MatchInterface,
  RoundInterface,
  TournamentPlayerInterface,
} from "@/interfaces";
import { orderMatchesByBye } from "@/utils/matches";
import { RoundStatusBadge } from "./RoundStatusBadge";
import { MatchCard } from "../current-round/MarchCard";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

export type RoundHistoryCardBaseClassNames = {
  container?: string;
  header?: string;
  title?: string;
  metaText?: string;
  divider?: string;
  tableHeader?: string;
  tableHeaderText?: string;
  matchDivider?: string;
  expandButton?: string;
  showAllButton?: string;
};

type RoundStatus = "IN_PROGRESS" | "FINISHED";

type Props = {
  round: RoundInterface;
  players: TournamentPlayerInterface[];
  status: RoundStatus;
  matches: MatchInterface[];
  readOnly?: boolean;
  onChangeResult?: (matchId: string, result: "P1" | "P2" | "DRAW") => void;
  renderResult?: (match: MatchInterface) => ReactNode;
  matchCardClassNames?: {
    container?: string;
    tableBadge?: string;
    tableText?: string;
    byeText?: string;
    byeImage?: string;
  };
  headerActions?: ReactNode;
  defaultExpanded?: boolean;
  allowExpand?: boolean;
  expanded?: boolean; // permite control desde el padre
  onToggleExpand?: (expanded: boolean) => void; // callback del padre
  maxVisibleMatches?: number;
  classNames?: RoundHistoryCardBaseClassNames;
};

export const RoundHistoryCardBase = ({
  round,
  players,
  status,
  matches,
  readOnly = true,
  onChangeResult,
  renderResult,
  matchCardClassNames,
  headerActions,
  defaultExpanded = true,
  allowExpand = true,
  expanded,
  onToggleExpand,
  maxVisibleMatches,
  classNames,
}: Props) => {
  // Estado interno solo para modo NO controlado
  const [internalExpanded, setInternalExpanded] =
    useState<boolean>(defaultExpanded);

  // Si el padre manda "expanded", se usa ese (controlado). Si no, se usa el interno.
  const isControlled = expanded !== undefined;
  const isExpanded = isControlled ? expanded : internalExpanded;

  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Si viene controlado desde el padre, no tocar el estado interno
    if (isControlled) return;

    // Modo NO controlado
    if (allowExpand) {
      setInternalExpanded(defaultExpanded);
    } else {
      setInternalExpanded(true);
    }
  }, [allowExpand, defaultExpanded, isControlled]);

  const orderedMatches = useMemo(() => orderMatchesByBye(matches), [matches]);
  const totalMatches = orderedMatches.length;
  const completedMatches = orderedMatches.filter(
    (match) => match.result !== null
  ).length;

  const visibleMatches = useMemo(() => {
    if (!maxVisibleMatches) return orderedMatches;
    return showAll
      ? orderedMatches
      : orderedMatches.slice(0, maxVisibleMatches);
  }, [orderedMatches, maxVisibleMatches, showAll]);

  return (
    <div
      className={clsx(
        "border rounded-xl shadow-sm py-3",
        classNames?.container ??
          "bg-white text-slate-900 border-tournament-dark-accent dark:bg-tournament-dark-surface dark:text-slate-200 dark:border-tournament-dark-border"
      )}
    >
      <div
        className={clsx(
          "flex justify-between items-center px-4",
          classNames?.header
        )}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3
              className={clsx(
                "font-semibold",
                classNames?.title ?? "text-slate-900 dark:text-slate-200"
              )}
            >
              Ronda {round.roundNumber}
            </h3>

            <RoundStatusBadge status={status} />

            {headerActions}
          </div>

          <p
            className={clsx(
              "text-sm",
              classNames?.metaText ?? "text-slate-500 dark:text-slate-400"
            )}
          >
            {status === "IN_PROGRESS"
              ? `${completedMatches} de ${totalMatches} partidas completadas`
              : `${totalMatches} partidas completadas`}
          </p>
        </div>

        {allowExpand && (
          <button
            onClick={() => {
              const next = !isExpanded;

              // Si el padre controla, avisarle
              if (onToggleExpand) {
                onToggleExpand(next);
                return;
              }

              // Si no es controlado, usar el interno
              setInternalExpanded(next);
            }}
            className={clsx(
              "p-1 rounded-md border border-tournament-dark-accent text-slate-500 transition hover:bg-slate-100 hover:text-purple-600 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-muted dark:hover:text-purple-300",
              classNames?.expandButton
            )}
          >
            {isExpanded ? <IoChevronUp /> : <IoChevronDown />}
          </button>
        )}
      </div>

      {isExpanded && (
        <>
          <hr
            className={clsx(
              "mt-3 border",
              classNames?.divider ??
                "border-slate-200 dark:border-tournament-dark-border"
            )}
          />

          <div>
            {visibleMatches.map((match, index) => (
              <div key={match.id}>
                <MatchCard
                  match={match}
                  tableNumber={index + 1}
                  players={players}
                  readOnly={readOnly}
                  decorated={false}
                  onChangeResult={onChangeResult}
                  renderResult={renderResult}
                  classNames={matchCardClassNames}
                />
                <hr
                  className={clsx(
                    "border",
                    classNames?.matchDivider ??
                      "border-slate-200 dark:border-tournament-dark-border"
                  )}
                />
              </div>
            ))}

            {maxVisibleMatches && orderedMatches.length > maxVisibleMatches && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAll((prev) => !prev)}
                  className={clsx(
                    "text-sm font-medium text-purple-600 hover:underline dark:text-purple-300",
                    classNames?.showAllButton
                  )}
                >
                  {showAll
                    ? "Mostrar menos"
                    : `Ver las ${orderedMatches.length} partidas`}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
