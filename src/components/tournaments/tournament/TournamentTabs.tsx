"use client";

import clsx from "clsx";
import { TournamentTab } from "@/app/administrador/torneos/[id]/page";

type Props = {
  active: TournamentTab;
  onChange: (tab: TournamentTab) => void;
  tournamentTitle: string;
  playersCount: number;
  tournamentStatus?: "pending" | "in_progress" | "finished";
};

const tabs: { id: TournamentTab; label: string }[] = [
  { id: "players", label: "Jugadores" },
  { id: "currentRound", label: "Ronda actual" },
  { id: "rounds", label: "Rondas" },
];

const MIN_PLAYERS_FOR_ROUND = 4;

export const TournamentTabs = ({
  active,
  onChange,
  tournamentTitle,
  playersCount,
  tournamentStatus,
}: Props) => {
  const canEnableCurrentRound =
    playersCount >= MIN_PLAYERS_FOR_ROUND && tournamentStatus !== "finished";

  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 pb-2 md:flex-row md:items-center md:justify-between">
      {/* IZQUIERDA: nombre del torneo */}
      <div className="font-semibold text-gray-900 text-base lg:text-lg truncate max-w-[70%]">
        {tournamentTitle}
      </div>

      {/* CENTRO: navegación */}
      <div className="flex flex-1 gap-6 justify-start md:justify-center">
        {tabs
          // Solo renderiza "Ronda actual" si está habilitada
          .filter((tab) => tab.id !== "currentRound" || canEnableCurrentRound)
          .map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                "relative whitespace-nowrap text-sm font-medium transition-colors",
                active === tab.id
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-gray-800"
              )}
            >
              {tab.label}

              {/* Línea inferior activa */}
              {active === tab.id && (
                <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
              )}
            </button>
          ))}
      </div>

      {/* DERECHA: editar torneo */}
      {/* <button
        onClick={() => {
          console.log("Editar torneo");
        }}
        className="
      flex items-center gap-2
      px-3 py-1.5
      text-sm lg:text-base
      font-medium text-gray-600
      border border-gray-300
      rounded-full
      bg-transparent
      hover:bg-gray-100 hover:text-gray-800
      transition
    "
      >
        <IoSettingsOutline className="w-4 h-4" />
        <span className="hidden sm:inline">Editar torneo</span>
      </button> */}
    </div>
  );
};
