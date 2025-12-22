"use client";

import type { ReactElement } from "react";
import clsx from "clsx";
import {
  IoPeopleOutline,
  IoPlayCircleOutline,
  IoListOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import { TournamentTab } from "@/app/administrador/torneos/[id]/page";

type Props = {
  active: TournamentTab;
  onChange: (tab: TournamentTab) => void;
  tournamentTitle: string;
  playersCount: number;
  tournamentStatus?: "pending" | "in_progress" | "finished" | "cancelled";
};

const tabs: { id: TournamentTab; label: string; icon: ReactElement }[] = [
  { id: "players", label: "Jugadores", icon: <IoPeopleOutline size={18} /> },
  {
    id: "currentRound",
    label: "Ronda actual",
    icon: <IoPlayCircleOutline size={18} />,
  },
  { id: "rounds", label: "Rondas", icon: <IoListOutline size={18} /> },
  {
    id: "information",
    label: "Información",
    icon: <IoInformationCircleOutline size={18} />,
  },
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
    playersCount >= MIN_PLAYERS_FOR_ROUND &&
    tournamentStatus !== "finished" &&
    tournamentStatus !== "cancelled";

  const visibleTabs = tabs.filter(
    (tab) => tab.id !== "currentRound" || canEnableCurrentRound
  );

  return (
    <>
      <div className="md:hidden font-semibold text-gray-900 text-base truncate">
        {tournamentTitle}
      </div>

      <div className="hidden md:flex flex-col gap-3 border-b border-gray-200 pb-2 md:flex-row md:items-center md:justify-between">
        <div className="font-semibold text-gray-900 text-base lg:text-lg truncate max-w-[70%]">
          {tournamentTitle}
        </div>

        <div className="flex flex-1 gap-6 justify-start md:justify-center">
          {visibleTabs.map((tab) => (
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

              {active === tab.id && (
                <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t bg-white">
        <div className="flex gap-2 px-4 overflow-x-auto">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                active === tab.id
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:text-gray-800"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
