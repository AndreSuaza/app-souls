import { notFound } from "next/navigation";
import { getPublicTournamentDetailAction } from "@/actions";
import { PublicTournamentDetail } from "@/components";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const detail = await getPublicTournamentDetailAction({
    tournamentId: id,
  });

  if (!detail?.tournament) {
    return {
      title: "Torneo no encontrado",
      description: "No encontramos el torneo solicitado.",
    };
  }

  const description = `Explora el torneo ${detail.tournament.title} de Souls In Xtinction TCG. Consulta fecha, sede, estado, rondas y clasificación, y comparte la información del evento con la comunidad.`;
  const canonical = `https://soulsinxtinction.com/torneos/${detail.tournament.id}`;

  return {
    title: `${detail.tournament.title} | Torneos`,
    description,
    keywords: [
      "Souls In Xtinction",
      "torneos",
      detail.tournament.title,
      detail.store.name,
      "TCG",
      "eventos",
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${detail.tournament.title} | Torneos`,
      description,
      url: canonical,
      siteName: "Torneos - Souls In Xtinction TCG",
      images: [
        {
          url: "https://soulsinxtinction.com/tournaments/SMCC-baner.jpg",
          width: 1200,
          height: 630,
          alt: "Torneo Souls In Xtinction TCG",
        },
      ],
      locale: "es_ES",
      type: "website",
    },
  };
}

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
