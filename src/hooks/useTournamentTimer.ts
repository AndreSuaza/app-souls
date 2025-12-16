"use client";

import { useEffect, useState } from "react";

type TimerValues = {
  hours: string;
  minutes: string;
  seconds: string;
};

export function useTournamentTimer(
  startedAt: string | null,
  status: "pending" | "in_progress" | "finished"
): TimerValues {
  const [time, setTime] = useState<TimerValues>({
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    // Si no ha iniciado o ya terminó, no correr timer
    if (!startedAt || status !== "in_progress") return;

    const start = new Date(startedAt).getTime();

    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, now - start);

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTime({
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
    };

    update(); // cálculo inmediato
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [startedAt, status]);

  return time;
}
