"use client";

import { MatchInterface } from "@/interfaces";
import { useTournamentStore } from "@/store";

/**
 * Selector visual del resultado del match
 * 1 / Empate / 2 con colores por hover/activo
 */
export const MatchResultSelector = ({ match }: { match: MatchInterface }) => {
  const { saveMatchResult } = useTournamentStore();

  const isBye =
    match.player2Nickname === null || match.player2Nickname === "BYE";

  return (
    <div className="flex items-center justify-center gap-2">
      <ResultButton
        label="Victoria"
        variant="p1"
        active={match.result === "P1"}
        disabled={isBye}
        onClick={() => saveMatchResult(match.id, "P1", match.player2Nickname)}
      />

      <ResultButton
        label="Empate"
        variant="draw"
        active={match.result === "DRAW"}
        disabled={isBye}
        onClick={() => saveMatchResult(match.id, "DRAW", match.player2Nickname)}
      />

      <ResultButton
        label="Victoria"
        variant="p2"
        active={match.result === "P2"}
        disabled={isBye}
        onClick={() => saveMatchResult(match.id, "P2", match.player2Nickname)}
      />
    </div>
  );
};

type Variant = "p1" | "draw" | "p2";

const ResultButton = ({
  label,
  active,
  onClick,
  variant,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant: Variant;
  disabled?: boolean;
}) => {
  const base =
    "px-3 py-1 rounded-md text-sm font-semibold transition select-none";
  const disabledStyles =
    "opacity-40 cursor-not-allowed bg-gray-100 text-gray-500";

  const stylesByVariant: Record<Variant, { active: string; idle: string }> = {
    p1: {
      active: "bg-blue-600 text-white",
      idle: "bg-gray-100 hover:bg-blue-100 hover:text-blue-700",
    },
    draw: {
      active: "bg-yellow-500 text-white",
      idle: "bg-gray-100 hover:bg-yellow-100 hover:text-yellow-700",
    },
    p2: {
      active: "bg-red-600 text-white",
      idle: "bg-gray-100 hover:bg-red-100 hover:text-red-700",
    },
  };

  if (disabled) {
    return (
      <button disabled className={`${base} ${disabledStyles}`}>
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${base} ${
        active ? stylesByVariant[variant].active : stylesByVariant[variant].idle
      }`}
    >
      {label}
    </button>
  );
};
