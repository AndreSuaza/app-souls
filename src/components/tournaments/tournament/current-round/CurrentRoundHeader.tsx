"use client";

import { useEffect, useMemo, useState } from "react";
import { IoReload } from "react-icons/io5";
import {
  useAlertConfirmationStore,
  useTournamentStore,
  useUIStore,
  useToastStore,
} from "@/store";
import { RoundProgressBar } from "./RoundProgressBar";
import { TournamentTimer } from "./TournamentTimer";
import { RoundActionButton } from "./RoundActionButton";
import { CurrentRoundTimerModal } from "./CurrentRoundTimerModal";

export const CurrentRoundHeader = () => {
  const { tournament, rounds, recalculateCurrentRound } = useTournamentStore();
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [canShowRecalculate, setCanShowRecalculate] = useState(false);
  const openAlertConfirmation = useAlertConfirmationStore(
    (s) => s.openAlertConfirmation
  );
  const showLoading = useUIStore((s) => s.showLoading);
  const hideLoading = useUIStore((s) => s.hideLoading);
  const showToast = useToastStore((s) => s.showToast);

  const TEN_MINUTES_MS = 10 * 60 * 1000;

  // Ronda actual (última generada)
  const currentRound = useMemo(() => {
    if (rounds.length === 0) return undefined;
    return rounds[rounds.length - 1];
  }, [rounds]);

  if (!tournament) return null;

  const isCurrentRound =
    currentRound?.roundNumber === tournament.currentRoundNumber + 1;

  useEffect(() => {
    if (!currentRound) {
      setCanShowRecalculate(false);
      return;
    }

    if (!currentRound.startedAt) {
      setCanShowRecalculate(true);
      return;
    }

    const startedAtMs = new Date(currentRound.startedAt).getTime();
    if (Number.isNaN(startedAtMs)) {
      setCanShowRecalculate(false);
      return;
    }

    const elapsed = Date.now() - startedAtMs;
    const remainingMs = TEN_MINUTES_MS - elapsed;

    if (remainingMs <= 0) {
      setCanShowRecalculate(false);
      return;
    }

    setCanShowRecalculate(true);

    // Oculta el boton cuando se cumplan los 10 minutos.
    const timeoutId = setTimeout(() => {
      setCanShowRecalculate(false);
    }, remainingMs);

    return () => clearTimeout(timeoutId);
  }, [TEN_MINUTES_MS, currentRound]);

  const handleRecalculateRound = () => {
    openAlertConfirmation({
      text: "¿Recalcular la ronda actual?",
      description:
        "Se reiniciara la ronda y se generaran nuevos emparejamientos.",
      action: async () => {
        showLoading("Recalculando ronda...");
        try {
          return await recalculateCurrentRound();
        } finally {
          hideLoading();
        }
      },
      onSuccess: () => {
        showToast("Ronda recalculada", "info");
      },
      onError: () => {
        showToast("Error al recalcular la ronda", "error");
      },
    });
  };

  const shouldShowRecalculate =
    !!currentRound && isCurrentRound && canShowRecalculate;

  return (
    <div className="w-full bg-white rounded-xl p-4 shadow-sm border flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Info de la ronda */}
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between md:flex-col md:items-start md:gap-2">
          {/* Estado del torneo */}
          <span
            className={`order-2 md:order-1 w-fit px-3 py-1 rounded-full text-xs font-semibold
            ${
              tournament.status === "in_progress"
                ? "bg-blue-100 text-blue-700"
                : tournament.status === "finished"
                ? "bg-gray-200 text-gray-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {tournament.status === "in_progress"
              ? "En progreso"
              : tournament.status === "finished"
              ? "Finalizado"
              : "Pendiente"}
          </span>

          {/* Número de ronda */}
          <h2 className="order-1 md:order-2 text-xl font-bold">
            Ronda {currentRound?.roundNumber ?? tournament.currentRoundNumber}
            {/* Mostrar "de X" solo si se ha generado al menos la priemra ronda*/}
            {tournament.maxRounds > 1 && ` de ${tournament.maxRounds}`}
          </h2>
        </div>

        {/* Progreso de partidas */}
        <RoundProgressBar round={currentRound} />
      </div>

      {/* Timer + Acción */}
      <div className="flex w-full flex-col items-center gap-2 lg:gap-3 md:w-auto md:flex-row md:items-center md:justify-normal">
        <button
          type="button"
          onClick={() => setIsTimerModalOpen(true)}
          className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          aria-label="Abrir temporizador"
          title="Abrir temporizador"
        >
          <TournamentTimer size="sm" />
        </button>

        {/* Separador visual (solo desktop) */}
        <div className="hidden md:block h-10 w-px bg-gray-300 mx-1 lg:mx-2" />

        <div className="flex w-full flex-col items-center gap-2 md:w-auto md:items-start">
          <div className="flex w-full justify-center md:justify-start [&>button]:w-full [&>button]:max-w-[220px] [&>button]:justify-center">
            <RoundActionButton />
          </div>
          {shouldShowRecalculate && (
            <button
              type="button"
              onClick={handleRecalculateRound}
              className="flex w-full max-w-[220px] items-center justify-center gap-2 px-2 sm:px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700"
            >
              <IoReload className="flex shrink-0" size={18} />
              Recalcular ronda
            </button>
          )}
        </div>
      </div>

      <CurrentRoundTimerModal
        open={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
      />
    </div>
  );
};
