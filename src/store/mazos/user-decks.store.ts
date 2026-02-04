import { create } from "zustand";
import { deleteDeckAction, getUserDecksFilteredAction } from "@/actions";
import type { Deck, DeckPagination, DeckFilteredResult } from "@/interfaces";
import type { DeckFiltersInput } from "@/schemas";

export type UserDeckFilters = {
  tournament: "all" | "with" | "without";
  date: "recent" | "old";
  archetypeId: string;
  likes: "" | "1";
};

interface State {
  decks: Deck[];
  pagination: DeckPagination;
  likedDeckIds: string[];
  filters: UserDeckFilters;
  nonTournamentCount: number;
  isLoading: boolean;
  hasLoaded: boolean;
  ensureLoaded: (hasSession: boolean) => Promise<void>;
  fetchDecks: (input: DeckFiltersInput) => Promise<DeckFilteredResult>;
  refreshDecks: (hasSession: boolean) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<boolean>;
  setFilters: (filters: UserDeckFilters) => void;
}

const initialFilters: UserDeckFilters = {
  tournament: "without",
  date: "recent",
  archetypeId: "",
  likes: "",
};

const emptyPagination: DeckPagination = {
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  perPage: 16,
};

const buildDeckSignature = (decks: Deck[]) =>
  decks
    .map(
      (deck) =>
        `${deck.id}:${deck.likesCount}:${deck.visible ? "1" : "0"}:${deck.name}`,
    )
    .join("|");

export const useUserDecksStore = create<State>()((set, get) => ({
  decks: [],
  pagination: emptyPagination,
  likedDeckIds: [],
  filters: initialFilters,
  nonTournamentCount: 0,
  isLoading: false,
  hasLoaded: false,

  setFilters: (filters) => set({ filters }),

  ensureLoaded: async (hasSession) => {
    if (!hasSession) {
      set({
        decks: [],
        pagination: emptyPagination,
        likedDeckIds: [],
        hasLoaded: true,
        isLoading: false,
      });
      return;
    }

    if (get().hasLoaded) return;
    set({ isLoading: true });
    const result = await getUserDecksFilteredAction({
      tournament: initialFilters.tournament,
      archetypeId: initialFilters.archetypeId,
      date: initialFilters.date,
      likes: false,
      page: 1,
    });
    set({
      decks: result.decks,
      pagination: {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        perPage: result.perPage,
      },
      likedDeckIds: result.likedDeckIds,
      nonTournamentCount: result.totalCount,
      hasLoaded: true,
      isLoading: false,
    });
  },

  fetchDecks: async (input) => {
    set({ isLoading: true });
    const result = await getUserDecksFilteredAction(input);
    const nextNonTournamentCount =
      input.tournament === "without"
        ? result.totalCount
        : get().nonTournamentCount;
    set({
      decks: result.decks,
      pagination: {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        perPage: result.perPage,
      },
      likedDeckIds: result.likedDeckIds,
      nonTournamentCount: nextNonTournamentCount,
      isLoading: false,
      hasLoaded: true,
    });
    return result;
  },

  refreshDecks: async (hasSession) => {
    if (!hasSession) return;
    const { filters, pagination, decks: currentDecks } = get();
    const result = await getUserDecksFilteredAction({
      tournament: filters.tournament,
      archetypeId: filters.archetypeId,
      date: filters.date,
      likes: filters.likes === "1",
      page: pagination.currentPage,
    });

    const currentSignature = buildDeckSignature(currentDecks);
    const nextSignature = buildDeckSignature(result.decks);

    // Solo refresca el grid si hay cambios reales en los mazos o la paginacion.
    if (
      currentSignature === nextSignature &&
      pagination.totalCount === result.totalCount &&
      pagination.totalPages === result.totalPages &&
      pagination.currentPage === result.currentPage
    ) {
      return;
    }

    const shouldUpdateNonTournamentCount =
      filters.tournament === "without" || filters.tournament === "all";

    set({
      decks: result.decks,
      pagination: {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        perPage: result.perPage,
      },
      likedDeckIds: result.likedDeckIds,
      nonTournamentCount: shouldUpdateNonTournamentCount
        ? result.totalCount
        : get().nonTournamentCount,
      hasLoaded: true,
      isLoading: false,
    });

    if (filters.tournament !== "without") {
      const countResult = await getUserDecksFilteredAction({
        tournament: "without",
        archetypeId: "",
        date: "recent",
        likes: false,
        page: 1,
      });
      set({ nonTournamentCount: countResult.totalCount });
    }
  },

  deleteDeck: async (deckId) => {
    set({ isLoading: true });
    try {
      await deleteDeckAction({ deckId });
      const { decks, pagination } = get();
      const nextDecks = decks.filter((deck) => deck.id !== deckId);
      const nextTotalCount = Math.max(0, pagination.totalCount - 1);
      const nextTotalPages = Math.max(
        1,
        Math.ceil(nextTotalCount / pagination.perPage),
      );

      set({
        decks: nextDecks,
        pagination: {
          ...pagination,
          totalCount: nextTotalCount,
          totalPages: nextTotalPages,
        },
        isLoading: false,
      });
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },
}));
