"use client";

import { MatchInterface } from "@/interfaces";
import { useTournamentStore } from "@/store";
import { ResultButton } from "./ResultButton";

export const MatchResultSelector = ({
  match,
  layout = "row",
  readOnly = false,
}: {
  match: MatchInterface;
  layout?: "row" | "mobileGrid";
  readOnly?: boolean; // Solo lectura
}) => {
  const { saveMatchResult } = useTournamentStore();

  const isBye =
    match.player2Nickname === null || match.player2Nickname === "BYE";

  // En readonly o BYE, no se puede interactuar
  const noInteraction = readOnly || isBye;

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
          onClick={() => saveMatchResult(match.id, "P1", match.player2Nickname)}
        />
      </div>

      <div className={layout === "mobileGrid" ? "flex justify-center" : ""}>
        <ResultButton
          label="Empate"
          variant="draw"
          active={match.result === "DRAW"}
          readOnly={noInteraction}
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
          readOnly={noInteraction}
          onClick={() => saveMatchResult(match.id, "P2", match.player2Nickname)}
        />
      </div>
    </div>
  );
};
