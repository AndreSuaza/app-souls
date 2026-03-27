import {
  getDeckById,
  getDecksByIds,
  getDeckFiltersAction,
  getPaginatedCards,
  getPropertiesCards,
} from "@/actions";
import { auth } from "@/auth";
import { DeckCreator } from "@/components";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Laboratorio de Mazos | Souls In Xtinction",
  description:
    "Diseña el mazo perfecto en el Laboratorio de Mazos de Souls In Xtinction TCG. Prueba combinaciones, ajusta estrategias y optimiza tu juego con nuestras herramientas avanzadas. ¡Prepara tu mazo y domina el campo de batalla!",
  keywords: [
    "Souls In Xtinction",
    "laboratorio de mazos",
    "mazos",
    "TCG",
    "estrategia",
    "cartas",
  ],
  alternates: {
    canonical: "https://soulsinxtinction.com/laboratorio",
  },
  openGraph: {
    title: "Laboratorio de Mazos | Souls In Xtinction",
    description:
      "Diseña el mazo perfecto en el Laboratorio de Mazos de Souls In Xtinction TCG. Prueba combinaciones, ajusta estrategias y optimiza tu juego con nuestras herramientas avanzadas. ¡Prepara tu mazo y domina el campo de batalla!",
    url: "https://soulsinxtinction.com/laboratorio",
    siteName: "Laboratorio Souls In Xtinction TCG",
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

interface Props {
  searchParams: Promise<{
    page?: string;
    text?: string;
    products?: string;
    types?: string;
    archetypes?: string;
    keywords?: string;
    costs?: string;
    forces?: string;
    defenses?: string;
    raritys?: string;
    decklist?: string;
    rarities?: string;
    limit?: string;
    id?: string;
  }>;
}

export default async function Cards({ searchParams }: Props) {
  const {
    text,
    products,
    types,
    archetypes,
    keywords,
    costs,
    forces,
    defenses,
    page,
    decklist,
    rarities,
    limit,
    id = "",
  } = await searchParams;
  const page2 = page ? parseInt(page) : 1;

  const [propertiesCards, session, deckFilters] = await Promise.all([
    getPropertiesCards(),
    auth(),
    getDeckFiltersAction(),
  ]);
  const { cards, totalPage, totalCount, perPage } = await getPaginatedCards({
    page: page2,
    text,
    products,
    types,
    archetypes,
    keywords,
    costs,
    forces,
    defenses,
    rarities,
    limit,
  });

  let decklistCards = decklist;

  let deckUser = null;

  if (id) {
    const getDeck = await getDeckById(id);
    if (getDeck) {
      if (getDeck.isAdminDeck && session?.user?.role !== "admin") {
        notFound();
      }
      deckUser = getDeck;
    decklistCards = deckUser.cards;
    }
  }

  const { mainDeck, sideDeck } = await getDecksByIds(decklistCards);
  const isOwnerDeck =
    Boolean(session?.user?.idd) && deckUser?.userId === session?.user?.idd;
  const MAX_TOURNAMENT_DECK_EDIT_DAYS = 7;
  const tournamentTypeName = deckUser?.tournament?.typeTournamentName ?? "";
  const tournamentStatus = deckUser?.tournament?.status ?? "";
  const tournamentFinishedAt = deckUser?.tournament?.finishedAt
    ? new Date(deckUser.tournament.finishedAt)
    : null;
  const isCompetitiveTier = ["Tier 1", "Tier 2"].includes(tournamentTypeName);
  const canEditDeck = !deckUser?.tournamentId
    ? true
    : isCompetitiveTier
      ? false
      : (() => {
          if (
            tournamentStatus === "pending" ||
            tournamentStatus === "in_progress"
          ) {
            return true;
          }
          if (tournamentStatus !== "finished" || !tournamentFinishedAt) {
            return false;
          }
          // Respeta la ventana de edición para Tier 3 luego de finalizar.
          const deadline = new Date(tournamentFinishedAt);
          deadline.setDate(deadline.getDate() + MAX_TOURNAMENT_DECK_EDIT_DAYS);
          return new Date() <= deadline;
        })();
  const canDeleteDeck = Boolean(deckUser?.id) && isOwnerDeck && canEditDeck;

  return (
    <>
      <h1 className="sr-only">Laboratorio de mazos</h1>
      <h2 className="sr-only">Crea y optimiza tu estrategia</h2>
      <DeckCreator
        cards={cards}
        propertiesCards={propertiesCards}
        mainDeck={mainDeck}
        sideDeck={sideDeck}
        totalPages={totalPage}
        totalCards={totalCount}
        perPage={perPage}
        initialPage={page2}
        className="h-full min-h-0"
        initialFilters={{
          text,
          products,
          types,
          archetypes,
          keywords,
          costs,
          forces,
          defenses,
          rarities,
          limit,
        }}
        hasSession={Boolean(session?.user)}
        archetypes={deckFilters.archetypes}
        deckId={deckUser?.id}
        deckData={deckUser}
        isOwnerDeck={isOwnerDeck}
        canEditDeck={canEditDeck}
        canDeleteDeck={canDeleteDeck}
      />
    </>
  );
}
