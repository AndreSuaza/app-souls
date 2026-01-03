import { TournamentInfoCard } from "../information/TournamentInfoCard";
import { type PublicTournamentDetail } from "@/interfaces";

type Props = {
  tournament: PublicTournamentDetail["tournament"];
};

export function PublicTournamentInformation({ tournament }: Props) {
  const form = {
    title: tournament.title,
    description: tournament.description ?? "",
    date: new Date(tournament.date),
  };

  return (
    <div className="space-y-6">
      {/* Se fuerza modo lectura para evitar cambios desde la vista publica. */}
      <TournamentInfoCard
        form={form}
        typeTournamentName={tournament.typeTournamentName ?? undefined}
        format={tournament.format ?? undefined}
        onChange={() => {}}
        onDelete={() => {}}
        isFinished
      />
    </div>
  );
}
