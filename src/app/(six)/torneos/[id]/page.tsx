import { notFound } from "next/navigation";
import { getPublicTournamentDetailAction } from "@/actions";
import { PublicTournamentDetail } from "@/components";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const tournament = await getPublicTournamentDetailAction({
    tournamentId: id,
  });

  if (!tournament) {
    notFound();
  }

  return <PublicTournamentDetail initialTournament={tournament} />;
}
