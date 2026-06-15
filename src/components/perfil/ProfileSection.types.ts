export type ProfileUser = {
  name?: string | null;
  lastname?: string | null;
  email?: string | null;
  nickname?: string | null;
  image?: string | null;
  bannerImage?: string | null;
  frameImage?: string | null;
  role?: string | null;
  victoryPoints?: number | null;
  eloPoints?: number | null;
  matchesPlayed?: number | null;
  tournamentsPlayed?: number | null;
};

export type ProfileCosmeticItem = {
  id: string;
  name: string;
  imageUrl: string;
};

export type DeckCounts = {
  totalDecks: number;
  publicDecks: number;
};

export type TournamentStatus =
  | "pending"
  | "in_progress"
  | "finished"
  | "cancelled";

export type TournamentHistoryItem = {
  id: string;
  title: string;
  date: string;
  status: TournamentStatus;
  playersCount: number;
};
