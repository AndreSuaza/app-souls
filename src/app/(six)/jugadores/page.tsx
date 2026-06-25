import type { Metadata } from "next";
import { getPublicPlayerRankingAction } from "@/actions/players/get-public-player-ranking.action";
import { PublicPlayerRanking } from "@/components/players/public/PublicPlayerRanking";

export const metadata: Metadata = {
  title: "Ranking de jugadores | Souls In Xtinction TCG",
  description:
    "Consulta la clasificación oficial de los 100 mejores jugadores de Souls In Xtinction TCG y descubre quiénes lideran el circuito competitivo.",
  keywords: [
    "Souls In Xtinction",
    "ranking",
    "jugadores",
    "Top 100",
    "ELO",
    "TCG",
  ],
  alternates: {
    canonical: "https://soulsinxtinction.com/jugadores",
  },
  openGraph: {
    title: "Clasificación de Almas | Souls In Xtinction TCG",
    description:
      "Los mejores jugadores del circuito competitivo de Souls In Xtinction.",
    url: "https://soulsinxtinction.com/jugadores",
    siteName: "Souls In Xtinction TCG",
    images: [
      {
        url: "https://soulsinxtinction.com/souls-in-xtinction.webp",
        width: 1200,
        height: 630,
        alt: "Ranking de jugadores de Souls In Xtinction",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
};

export const revalidate = 600;

export default async function JugadoresPage() {
  const players = await getPublicPlayerRankingAction();

  return <PublicPlayerRanking players={players} />;
}
