"use client";

import clsx from "clsx";

interface Props {
  rank: number;
  showPodium?: boolean;
}

export const RankBadge = ({ rank, showPodium = true }: Props) => {
  const showRankColors = showPodium && rank <= 3;

  return (
    <span
      className={clsx(
        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
        {
          "bg-yellow-200 text-yellow-900": showRankColors && rank === 1,
          "bg-gray-200 text-gray-800": showRankColors && rank === 2,
          "bg-orange-200 text-orange-900": showRankColors && rank === 3,
          "bg-gray-100 text-gray-600": !showRankColors,
        }
      )}
    >
      {rank}
    </span>
  );
};
