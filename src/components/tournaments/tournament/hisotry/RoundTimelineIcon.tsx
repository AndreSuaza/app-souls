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
      className={`w-8 h-8 bg-white rounded-full flex items-center justify-center border ${
        isCurrentRound
          ? "text-blue-600 border-blue-600"
          : "text-green-600 border-gray-300"
      }`}
    >
      {isCurrentRound ? <FaClock size={14} /> : <FaCheckCircle size={14} />}
    </div>
  );
};
