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

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
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
  if (!deck) {
    notFound();
  }

  const userId = session?.user?.idd;
  if (deck.visible === false && deck.userId !== userId) {
    notFound();
  }

  const decklistCards = deck.cards?.replaceAll("%2C", ",") ?? "";
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
