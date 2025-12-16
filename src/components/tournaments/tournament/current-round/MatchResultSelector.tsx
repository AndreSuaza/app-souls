"use client";

import { MatchInterface } from "@/interfaces";
import { useTournamentStore } from "@/store";

export const MatchResultSelector = ({
  match,
  layout = "row",
}: {
  match: MatchInterface;
  layout?: "row" | "mobileGrid";
}) => {
  const { saveMatchResult } = useTournamentStore();

  const isBye =
    match.player2Nickname === null || match.player2Nickname === "BYE";

  return (
    <div
      className={
        layout === "mobileGrid"
          ? "grid grid-cols-3 gap-2 w-full md:flex md:items-center md:justify-center"
          : "flex items-center justify-center gap-2"
      }
    >
      <div className={layout === "mobileGrid" ? "flex justify-end" : ""}>
        <ResultButton
          label="Victoria"
          variant="p1"
          active={match.result === "P1"}
          disabled={isBye}
          onClick={() => saveMatchResult(match.id, "P1", match.player2Nickname)}
        />
      </div>

      <div className={layout === "mobileGrid" ? "flex justify-center" : ""}>
        <ResultButton
          label="Empate"
          variant="draw"
          active={match.result === "DRAW"}
          disabled={isBye}
          onClick={() =>
            saveMatchResult(match.id, "DRAW", match.player2Nickname)
          }
        />
      </div>

      <div className={layout === "mobileGrid" ? "flex justify-start" : ""}>
        <ResultButton
          label="Victoria"
          variant="p2"
          active={match.result === "P2"}
          disabled={isBye}
          onClick={() => saveMatchResult(match.id, "P2", match.player2Nickname)}
        />
      </div>
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
      active: "bg-indigo-600 text-white",
      idle: "bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700",
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
