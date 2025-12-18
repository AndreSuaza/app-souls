"use client";

import { MatchInterface } from "@/interfaces";
import { useTournamentStore } from "@/store";
import { ResultButton } from "./ResultButton";

interface MatchResultSelectorProps {
  match: MatchInterface;
  layout?: "row" | "mobileGrid";
  readOnly?: boolean;
  onChangeResult?: (result: "P1" | "P2" | "DRAW") => void;
}

export const MatchResultSelector = ({
  match,
  layout = "row",
  readOnly = false, // solo lectura
  onChangeResult,
}: MatchResultSelectorProps) => {
  const { saveMatchResult } = useTournamentStore();

  const isBye =
    match.player2Nickname === null || match.player2Nickname === "BYE";

  // En readonly o BYE, no se puede interactuar
  const noInteraction = readOnly || isBye;

  // Decide si usar edición local o store
  const handleResult = (result: "P1" | "P2" | "DRAW") => {
    if (onChangeResult) {
      onChangeResult(result); // edición local
    } else {
      saveMatchResult(match.id, result, match.player2Nickname); // normal
    }
  };
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
          readOnly={noInteraction}
          onClick={() => handleResult("P1")}
        />
      </div>

      <div className={layout === "mobileGrid" ? "flex justify-center" : ""}>
        <ResultButton
          label="Empate"
          variant="draw"
          active={match.result === "DRAW"}
          readOnly={noInteraction}
          onClick={() => handleResult("DRAW")}
        />
      </div>

      <div className={layout === "mobileGrid" ? "flex justify-start" : ""}>
        <ResultButton
          label="Victoria"
          variant="p2"
          active={match.result === "P2"}
          readOnly={noInteraction}
          onClick={() => handleResult("P2")}
        />
      </div>
    </div>
  );
};
