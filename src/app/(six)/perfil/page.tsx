import {
  getAvatars,
  getProfileBanners,
  getActiveTournament,
  getUserTournaments,
  getProfileDeckCountsAction,
} from "@/actions";
import { getUserById } from "@/actions/auth/find-user";
import { Pefil } from "@/components/perfil/perfil";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil de jugador | Souls In Xtinction TCG",
  description:
    "Gestiona tu perfil de Souls In Xtinction TCG, revisa tu progreso, torneos activos e historial, y administra tus mazos personales. Actualiza tu avatar y mantente al día con tu rendimiento competitivo.",
  keywords: [
    "Souls In Xtinction",
    "perfil",
    "jugador",
    "TCG",
    "mazos",
    "torneos",
  ],
  alternates: {
    canonical: "https://soulsinxtinction.com/perfil",
  },
  openGraph: {
    title: "Perfil de jugador | Souls In Xtinction TCG",
    description:
      "Gestiona tu perfil de Souls In Xtinction TCG, revisa tu progreso, torneos activos e historial, y administra tus mazos personales. Actualiza tu avatar y mantente al día con tu rendimiento competitivo.",
    url: "https://soulsinxtinction.com/perfil",
    siteName: "Souls In Xtinction TCG",
    images: [
      {
        url: "https://soulsinxtinction.com/souls-in-xtinction.webp",
        width: 800,
        height: 600,
        alt: "Souls In Xtinction TCG",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export default async function PerfilPage() {
  const user = await getUserById();
  const avatars = await getAvatars();
  const banners = await getProfileBanners();
  const activeTournament = await getActiveTournament();
  const tournaments = await getUserTournaments();
  const deckCounts = await getProfileDeckCountsAction();
  // const userDecks = await getDecksByUser();

  return (
    <>
      {user && (
        <Pefil
          user={user}
          avatars={avatars}
          banners={banners}
          activeTournament={activeTournament}
          tournaments={tournaments}
          deckCounts={deckCounts}
        />
      )}
    </>
  );
}
