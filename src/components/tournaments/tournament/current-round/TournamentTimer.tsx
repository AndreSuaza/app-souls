"use client";

import { useTournamentStore } from "@/store";
import { useTournamentTimer } from "@/hooks";

export const TournamentTimer = () => {
  const { tournament } = useTournamentStore();

  const { hours, minutes, seconds } = useTournamentTimer(
    tournament?.startedAt ?? null,
    tournament?.status ?? "pending"
  );

  return (
    <div className="flex items-center gap-2">
      <TimeBox value={hours} label="HRS" />
      <TimeSeparator />
      <TimeBox value={minutes} label="MIN" />
      <TimeSeparator />
      <TimeBox value={seconds} label="SEC" />
    </div>
  );
};

// Caja individual del tiempo
const TimeBox = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center bg-gray-100 rounded-lg px-3 py-2 min-w-[56px]">
    <span className="text-lg font-bold leading-none">{value}</span>
    <span className="text-xs text-gray-500">{label}</span>
  </div>
);

// Separador visual ":" entre cajas
const TimeSeparator = () => (
  <span className="text-lg font-bold text-gray-500">:</span>
);
