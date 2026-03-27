import { notFound } from "next/navigation";
import { auth } from "@/auth";
import {
  getDeckById,
  getDecksByIds,
  getDeckFiltersAction,
  getTournamentSummaryAction,
  getDeckLikeStatusAction,
} from "@/actions";
import { DeckDetailView } from "@/components";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const deck = await getDeckById(id);

  if (!deck || deck.isAdminDeck) {
    return {
      title: "Mazo no encontrado",
      description: "No encontramos el mazo solicitado.",
    };
  }

  const description = `Explora el mazo ${deck.name} en Souls In Xtinction TCG. Revisa su arquetipo, cartas principales y estrategia, y descubre si esta asociado a un torneo o creado por la comunidad.`;
  const canonical = `https://soulsinxtinction.com/mazos/${deck.id}`;

  return {
    title: `${deck.name} | Mazos`,
    description,
    keywords: [
      "Souls In Xtinction",
      "mazos",
      deck.name,
      deck.archetype?.name ?? "sin arquetipo",
      "TCG",
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${deck.name} | Mazos`,
      description,
      url: canonical,
      siteName: "Mazos - Souls In Xtinction TCG",
      images: [
        {
          url: `https://soulsinxtinction.com/cards/${deck.imagen}.webp`,
          width: 800,
          height: 600,
          alt: deck.name,
        },
      ],
      locale: "es_ES",
      type: "website",
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const [deck, session, filters] = await Promise.all([
    getDeckById(id),
    auth(),
    getDeckFiltersAction(),
  ]);
  if (!deck || deck.isAdminDeck) {
    notFound();
  }

  const userId = session?.user?.idd;
  const role = session?.user?.role;
  const storeId = session?.user?.storeId ?? null;
  const isOwner = Boolean(userId && deck.userId === userId);
  const isPrivate = deck.visible === false;
  const hasTournament = Boolean(deck.tournamentId);
  // Regla de acceso: admin/store pueden ver mazos privados solo si estan asociados a torneo.
  const canViewPrivateAsAdmin = role === "admin" && hasTournament;
  // Para store, ademas el torneo debe pertenecer a su misma tienda.
  const canViewPrivateAsStore =
    role === "store" &&
    hasTournament &&
    Boolean(storeId && deck.tournament?.storeId === storeId);

  if (
    isPrivate &&
    !isOwner &&
    !canViewPrivateAsAdmin &&
    !canViewPrivateAsStore
  ) {
    notFound();
  }

  const decklistCards = deck.cards ?? "";
  const [deckLists, tournamentSummary, likeStatus] = await Promise.all([
    getDecksByIds(decklistCards),
    deck.tournamentId
      ? getTournamentSummaryAction(deck.tournamentId)
      : Promise.resolve(null),
    getDeckLikeStatusAction(deck.id),
  ]);
  const { mainDeck, sideDeck } = deckLists;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-4 pb-12 pt-6 dark:from-tournament-dark-bg dark:via-tournament-dark-muted dark:to-tournament-dark-bg sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="sr-only">Detalle del mazo</h2>
        <DeckDetailView
          deck={deck}
          mainDeck={mainDeck}
          sideDeck={sideDeck}
          hasSession={Boolean(session?.user)}
          archetypes={filters.archetypes}
          isOwner={Boolean(userId && deck.userId === userId)}
          tournamentName={tournamentSummary?.title ?? null}
          isLiked={likeStatus.liked}
        />
      </div>
    </main>
  );
}
