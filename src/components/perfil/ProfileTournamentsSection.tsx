"use client";

import { IoListOutline, IoTrophyOutline } from "react-icons/io5";
import type { ActiveTournamentData, TournamentSnapshot } from "@/interfaces";
import { ProfileCurrentTournament } from "./ProfileCurrentTournament";
import { ProfileSectionsTabs, type ProfileTab } from "./ProfileSectionsTabs";
import { ProfileTournamentHistorySection } from "./ProfileTournamentHistorySection";
import { ProfileTournamentSection } from "./ProfileTournamentSection";
import type { TournamentHistoryItem } from "./ProfileSection.types";

type Props = {
  activeTab: ProfileTab;
  onChangeTab: (tab: ProfileTab) => void;
  tournamentTabLabel: string;
  activeTournament: ActiveTournamentData | null;
  fallbackTournamentData: ActiveTournamentData;
  hasSession: boolean;
  isPlayer: boolean;
  hasTournamentTab: boolean;
  showHistoryTab: boolean;
  tournaments: TournamentHistoryItem[];
  selectedTournament: TournamentSnapshot | null;
  onSelectTournament: (tournamentId: string) => void;
};

export const ProfileTournamentsSection = ({
  activeTab,
  onChangeTab,
  tournamentTabLabel,
  activeTournament,
  fallbackTournamentData,
  hasSession,
  isPlayer,
  hasTournamentTab,
  showHistoryTab,
  tournaments,
  selectedTournament,
  onSelectTournament,
}: Props) => {
  return (
    <div className="space-y-4">
      <ProfileSectionsTabs
        active={activeTab}
        onChange={onChangeTab}
        tabs={[
          {
            id: "tournament",
            label: tournamentTabLabel,
            icon: <IoTrophyOutline className="h-4 w-4" />,
            content: (
              <ProfileTournamentSection
                activeTournament={activeTournament}
                hasSession={hasSession}
                isPlayer={isPlayer}
              />
            ),
            hidden: !hasTournamentTab,
          },
          {
            id: "history",
            label: "Torneos jugados",
            icon: <IoListOutline className="h-4 w-4" />,
            content: (
              <ProfileTournamentHistorySection
                tournaments={tournaments}
                onSelectTournament={onSelectTournament}
              />
            ),
            hidden: !showHistoryTab,
          },
          {
            id: "selected",
            label: "Torneo",
            icon: <IoTrophyOutline className="h-4 w-4" />,
            content: selectedTournament ? (
              <section className="w-full space-y-4">
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-purple-200">
                  Torneo seleccionado
                </h2>
                <ProfileCurrentTournament
                  data={activeTournament ?? fallbackTournamentData}
                  selectedTournament={selectedTournament}
                  enableDeckAssociation={isPlayer}
                  hasSession={hasSession}
                />
              </section>
            ) : null,
            hidden: !selectedTournament,
          },
        ]}
      />
      {!hasTournamentTab && !showHistoryTab && !selectedTournament && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70 dark:text-slate-300">
          No hay torneos disponibles para mostrar.
        </div>
      )}
    </div>
  );
};
