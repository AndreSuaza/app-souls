import { Suspense } from "react";
import { getPublicTournaments } from "@/actions";
import { Metadata } from "next";
import { PublicTournamentsHero, PublicTournamentsList } from "@/components";

export const metadata: Metadata = {
  title: "Torneos de Souls In Xtinction TCG | Compite y Demuestra tu Habilidad",
  description:
    "Participa en los torneos oficiales de Souls In Xtinction TCG y enfrentate a los mejores jugadores. Consulta fechas, inscripciones, reglas y premios.",
  openGraph: {
    title:
      "Torneos de Souls In Xtinction TCG | Compite y Demuestra tu Habilidad",
    description:
      "Participa en los torneos oficiales de Souls In Xtinction TCG y enfrentate a los mejores jugadores. Consulta fechas, inscripciones, reglas y premios.",
    url: "https://soulsinxtinction.com/tiendas",
    siteName: "Torneos Souls In Xtinction TCG",
    images: [
      {
        url: "https://soulsinxtinction.com/souls-in-xtinction.webp",
        width: 800,
        height: 600,
        alt: "Souls In Xtinction TCG",
      },
    ],
    locale: "en_ES",
    type: "website",
  },
};

export default async function EventosPage() {
  const { tournaments, heroTournament } = await getPublicTournaments();
  const listTournaments = tournaments.map((tournament) => ({
    id: tournament.id,
    title: tournament.title,
    status: tournament.status,
    date: tournament.date.toISOString(),
    storeName: tournament.store.name,
  }));

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-tournament-dark-bg dark:text-white">
      <div className="mx-auto flex min-h-screen flex-col gap-12 pb-16 pt-0 sm:pt-8">
        <div className="px-0 sm:px-6 md:px-10 lg:px-16">
          <PublicTournamentsHero
            tournament={
              heroTournament
                ? {
                    id: heroTournament.id,
                    title: heroTournament.title,
                    date: heroTournament.date.toISOString(),
                    status: heroTournament.status,
                  }
                : null
            }
          />
        </div>

        <div className="px-3 sm:px-6 md:px-10 lg:px-16">
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
