"use client";

import type { ComponentProps } from "react";
import { ProfileTournamentHistory } from "./ProfileTournamentHistory";

type Props = ComponentProps<typeof ProfileTournamentHistory>;

export const ProfileTournamentHistorySection = ({
  tournaments,
  onSelectTournament,
}: Props) => {
  return (
    <section className="w-full space-y-4">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-purple-200">
        Torneos jugados
      </h2>
      <ProfileTournamentHistory
        tournaments={tournaments}
        onSelectTournament={onSelectTournament}
      />
    </section>
  );
};
