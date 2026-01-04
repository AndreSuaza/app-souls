"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import type { ReactNode } from "react";
import {
  MatchInterface,
  RoundInterface,
  TournamentPlayerInterface,
} from "@/interfaces";
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
  maxVisibleMatches,
  classNames,
}: Props) => {
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (allowExpand) {
      setExpanded(defaultExpanded);
    } else {
      setExpanded(true);
    }
  }, [allowExpand, defaultExpanded]);

  const totalMatches = matches.length;
  const completedMatches = matches.filter(
    (match) => match.result !== null
  ).length;

  const visibleMatches = useMemo(() => {
    if (!maxVisibleMatches) return matches;
    return showAll ? matches : matches.slice(0, maxVisibleMatches);
  }, [matches, maxVisibleMatches, showAll]);

  return (
    <div
      className={clsx(
        "border rounded-xl shadow-sm py-3",
        classNames?.container ?? "bg-white"
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
                classNames?.title ?? "text-gray-800"
              )}
            >
              Ronda {round.roundNumber}
            </h3>

            <RoundStatusBadge status={status} />

            {headerActions}
          </div>

          <p
            className={clsx("text-sm", classNames?.metaText ?? "text-gray-500")}
          >
            {status === "IN_PROGRESS"
              ? `${completedMatches} de ${totalMatches} partidas completadas`
              : `${totalMatches} partidas completadas`}
          </p>
        </div>

        {allowExpand && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className={clsx("p-1 rounded-md border", classNames?.expandButton)}
          >
            {expanded ? <IoChevronUp /> : <IoChevronDown />}
          </button>
        )}
      </div>

      {expanded && (
        <>
          <hr
            className={clsx(
              "mt-3 border",
              classNames?.divider ?? "border-gray-200"
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
                    classNames?.matchDivider ?? "border-gray-200"
                  )}
                />
              </div>
            ))}

            {maxVisibleMatches && matches.length > maxVisibleMatches && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAll((prev) => !prev)}
                  className={clsx(
                    "text-sm font-medium text-indigo-600 hover:underline",
                    classNames?.showAllButton
                  )}
                >
                  {showAll
                    ? "Mostrar menos"
                    : `Ver las ${matches.length} partidas`}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
