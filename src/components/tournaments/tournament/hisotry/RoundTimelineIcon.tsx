"use client";

import { FaClock, FaCheckCircle } from "react-icons/fa";
import { RoundInterface } from "@/interfaces";
import { BasicTournament } from "@/store";

interface Props {
  round: RoundInterface;
  tournament: BasicTournament;
}

export const RoundTimelineIcon = ({ round, tournament }: Props) => {
  const isCurrentRound =
    round.roundNumber === tournament.currentRoundNumber + 1 &&
    tournament.status === "in_progress";

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center border bg-white dark:bg-tournament-dark-surface ${
        isCurrentRound
          ? "text-purple-600 border-purple-600/40"
          : "text-emerald-600 border-slate-200 dark:text-emerald-300 dark:border-tournament-dark-border"
      }`}
    >
      {isCurrentRound ? <FaClock size={14} /> : <FaCheckCircle size={14} />}
    </div>
  );
};
