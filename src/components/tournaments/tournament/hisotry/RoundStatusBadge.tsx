"use client";

import clsx from "clsx";

type RoundStatus = "IN_PROGRESS" | "FINISHED";

interface Props {
  status: RoundStatus;
}

export const RoundStatusBadge = ({ status }: Props) => {
  return (
    <span
      className={clsx(
        "px-2 py-0.5 rounded-full text-xs font-semibold",
        status === "IN_PROGRESS"
          ? "bg-blue-100 text-blue-700"
          : "bg-green-100 text-green-700"
      )}
    >
      {status === "IN_PROGRESS" ? "En progreso" : "Finalizada"}
    </span>
  );
};
