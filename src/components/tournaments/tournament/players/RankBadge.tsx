"use client";

import clsx from "clsx";

interface Props {
  rank: number;
}

export const RankBadge = ({ rank }: Props) => {
  return (
    <span
      className={clsx(
        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
        {
          "bg-yellow-200 text-yellow-900": rank === 1,
          "bg-gray-200 text-gray-800": rank === 2,
          "bg-orange-200 text-orange-900": rank === 3,
          "bg-gray-100 text-gray-600": rank > 3,
        }
      )}
    >
      {rank}
    </span>
  );
};
