export interface DeckUser {
  nickname: string | null;
  name?: string | null;
  lastname?: string | null;
}

export interface DeckArchetype {
  id: string;
  name: string | null;
}

// Opcion reutilizable para selects/filtros por arquetipo.
export interface ArchetypeOption {
  id: string;
  name: string | null;
}

export interface Deck {
  id: string;
  name: string;
  description?: string | null;
  imagen: string;
  cards: string;
  likesCount: number;
  createdAt: Date | string;
  tournamentId?: string | null;
  userId?: string;
  user: DeckUser;
  archetype: DeckArchetype;
}

export interface DeckPagination {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export interface DeckFilteredResult extends DeckPagination {
  decks: Deck[];
  likedDeckIds: string[];
}
