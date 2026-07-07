import { getDeckFiltersAction } from "@/actions/decks/get-deck-filters.action";
import { getDecksFilteredAction } from "@/actions/decks/get-decks-filtered.action";
import { DeckLibrary } from "@/components/mazos/deck-library/DeckLibrary";
import type { DeckFiltersState } from "@/components/mazos/deck-filters/DeckFiltersBar";
import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Mazos Souls In Xtinction TCG | Biblioteca",
  description:
    "Explora la biblioteca de mazos de Souls In Xtinction TCG. Filtra por arquetipos, fechas y torneos, descubre listas creadas por la comunidad y guarda tus favoritos para inspirar tu proximo deck.",
  keywords: [
    "Souls In Xtinction",
    "mazos",
    "biblioteca de mazos",
    "TCG",
    "arquetipos",
    "torneos",
    "estrategias",
  ],
  alternates: {
    canonical: "https://soulsinxtinction.com/mazos",
  },
  openGraph: {
    title: "Mazos Souls In Xtinction TCG | Biblioteca",
    description:
      "Explora la biblioteca de mazos de Souls In Xtinction TCG. Filtra por arquetipos, fechas y torneos, descubre listas creadas por la comunidad y guarda tus favoritos para inspirar tu proximo deck.",
    url: "https://soulsinxtinction.com/mazos",
    siteName: "Biblioteca de Mazos Souls In Xtinction TCG",
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

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const getParam = (value: string | string[] | undefined): string | undefined => {
  return Array.isArray(value) ? value[0] : value;
};

const normalizeTournament = (
  value: string | undefined,
): DeckFiltersState["tournament"] => {
  return value === "without" ? "without" : "with";
};

const normalizeDate = (value: string | undefined): DeckFiltersState["date"] => {
  return value === "old" ? "old" : "recent";
};

const normalizePage = (value: string | undefined): number => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
};

export default async function Page({ searchParams }: PageProps) {
  // En Next 15, searchParams puede llegar como Promise y debe resolverse primero.
  const params = await searchParams;

  const tournamentParam = getParam(params.tournament);
  const archetypeIdParam = getParam(params.archetype);
  const dateParam = getParam(params.date);
  const likesParam = getParam(params.likes);
  const pageParam = getParam(params.page);
  const initialPage = normalizePage(pageParam);

  const initialFilters: DeckFiltersState = {
    tournament: normalizeTournament(tournamentParam),
    date: normalizeDate(dateParam),
    archetypeId: archetypeIdParam ?? "",
    likes: likesParam === "1" ? "1" : "",
  };

  const [decksResult, filters] = await Promise.all([
    getDecksFilteredAction({
      tournament: initialFilters.tournament,
      archetypeId: initialFilters.archetypeId || undefined,
      date: initialFilters.date,
      likes: initialFilters.likes === "1",
      page: initialPage,
      includeLikedDeckIds: false,
    }),
    getDeckFiltersAction(),
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-4 pb-12 pt-6 dark:from-tournament-dark-bg dark:via-tournament-dark-muted dark:to-tournament-dark-bg sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-6 -mt-6">
        <h1 className="sr-only">Biblioteca de mazos</h1>
        <h2 className="sr-only">Explora mazos creados por la comunidad</h2>
        <DeckLibrary
          initialDecks={decksResult.decks}
          initialPagination={{
            totalCount: decksResult.totalCount,
            totalPages: decksResult.totalPages,
            currentPage: decksResult.currentPage,
            perPage: decksResult.perPage,
          }}
          initialLikedDeckIds={decksResult.likedDeckIds}
          archetypes={filters.archetypes}
          initialFilters={initialFilters}
          hasSession={false}
        />
      </div>
    </main>
  );
}
