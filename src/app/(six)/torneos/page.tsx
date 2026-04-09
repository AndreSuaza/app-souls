import { Suspense } from "react";
import { getPublicTournaments } from "@/actions";
import { Metadata } from "next";
import {
  PublicTournamentsHero,
  PublicTournamentsHighlights,
  PublicTournamentsList,
} from "@/components";

export const metadata: Metadata = {
  title: "Torneos Souls In Xtinction TCG | Calendario",
  description:
    "Participa en los torneos oficiales de Souls In Xtinction TCG y enfrentate a los mejores jugadores. Consulta fechas, inscripciones, reglas y premios.",
  keywords: [
    "Souls In Xtinction",
    "torneos",
    "calendario",
    "eventos",
    "TCG",
    "competitivo",
  ],
  alternates: {
    canonical: "https://soulsinxtinction.com/torneos",
  },
  openGraph: {
    title: "Torneos Souls In Xtinction TCG | Calendario",
    description:
      "Participa en los torneos oficiales de Souls In Xtinction TCG y enfrentate a los mejores jugadores. Consulta fechas, inscripciones, reglas y premios.",
    url: "https://soulsinxtinction.com/torneos",
    siteName: "Torneos - Souls In Xtinction TCG",
    images: [
      {
        url: "https://soulsinxtinction.com/tournaments/SMCC-baner.jpg",
        width: 800,
        height: 600,
        alt: "Torneos Souls In Xtinction TCG",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export const revalidate = 60;

const isHeroTournament = (
  tournament: Awaited<
    ReturnType<typeof getPublicTournaments>
  >["heroTournament"],
): tournament is NonNullable<
  Awaited<ReturnType<typeof getPublicTournaments>>["heroTournament"]
> & {
  status: "pending" | "in_progress";
} => {
  if (!tournament) return false;
  return tournament.status === "pending" || tournament.status === "in_progress";
};

export default async function EventosPage() {
  const { tournaments, heroTournament, tierTournaments, topPlayers } =
    await getPublicTournaments();
  const resolvedHeroTournament = isHeroTournament(heroTournament)
    ? heroTournament
    : null;
  const listTournaments = tournaments.map((tournament) => ({
    id: tournament.id,
    title: tournament.title,
    status: tournament.status,
    date: tournament.date.toISOString(),
    storeName: tournament.storeName ?? null,
  }));
  const tierListTournaments = tierTournaments.map((tournament) => ({
    id: tournament.id,
    title: tournament.title,
    status: tournament.status,
    date: tournament.date.toISOString(),
    storeName: tournament.storeName ?? null,
    tierName: tournament.tierName,
  }));

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-tournament-dark-bg dark:text-white">
      <div className="mx-auto flex min-h-screen flex-col gap-12 pb-16 pt-0 sm:pt-8">
        <div className="px-0 sm:px-6 md:px-10 lg:px-16">
          <PublicTournamentsHero
            tournament={
              resolvedHeroTournament
                ? {
                    id: resolvedHeroTournament.id,
                    title: resolvedHeroTournament.title,
                    date: resolvedHeroTournament.date.toISOString(),
                    status: resolvedHeroTournament.status,
                  }
                : null
            }
          />
        </div>

        <div className="px-3 sm:px-6 md:px-10 lg:px-16">
          <Suspense
            fallback={
              <div className="rounded-xl border border-dashed border-tournament-dark-accent bg-white p-6 text-center text-sm text-slate-500 dark:border-tournament-dark-accent dark:bg-tournament-dark-surface dark:text-slate-300">
                Cargando destacados...
              </div>
            }
          >
            <PublicTournamentsHighlights
              tierTournaments={tierListTournaments}
              topPlayers={topPlayers}
            />
          </Suspense>
        </div>

        <div className="px-3 sm:px-6 md:px-10 lg:px-16 md:mt-6">
          <Suspense
            fallback={
              <div className="rounded-xl border border-dashed border-tournament-dark-accent bg-white p-6 text-center text-sm text-slate-500 dark:border-tournament-dark-accent dark:bg-tournament-dark-surface dark:text-slate-300">
                Cargando torneos...
              </div>
            }
          >
            <PublicTournamentsList tournaments={listTournaments} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
