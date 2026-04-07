"use client";

import type { Deck, DeckPagination } from "@/interfaces";
import { DeckLibrary } from "../mazos/deck-library/DeckLibrary";
import type { DeckFiltersState } from "../mazos/deck-filters/DeckFiltersBar";
import { getPublicDecksByUserAction } from "@/actions";

type Props = {
  userId: string;
  initialDecks: Deck[];
  initialPagination: DeckPagination;
  initialLikedDeckIds: string[];
  hasSession: boolean;
};

const DEFAULT_FILTERS: DeckFiltersState = {
  tournament: "with",
  archetypeId: "",
  date: "recent",
  likes: "",
};

export const ProfilePublicDecksSection = ({
  userId,
  initialDecks,
  initialPagination,
  initialLikedDeckIds,
  hasSession,
}: Props) => {
  return (
    <section id="public-decks" className="w-full space-y-4">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-purple-200">
        Mazos publicos
      </h2>
      <DeckLibrary
        initialDecks={initialDecks}
        initialPagination={initialPagination}
        initialLikedDeckIds={initialLikedDeckIds}
        archetypes={[]}
        initialFilters={DEFAULT_FILTERS}
        hasSession={hasSession}
        fetchDecksAction={(input) =>
          getPublicDecksByUserAction({ ...input, userId })
        }
        disableUrlSync
        hideFilters
        showDeleteButton={false}
        getDeckHref={(deck) => `/mazos/${deck.id}`}
        emptyStateText="Este jugador aun no tiene mazos publicos."
      />
    </section>
  );
};
