import { Store } from "./store.interface";

export interface Tournament {
  id: string;
  title: string;
  description: string;
  lat: number;
  lgn: number;
  format: string;
  date: Date;
  image?: string | null;
  status: "pending" | "in_progress" | "finished" | "cancelled";
  currentRoundNumber: number;
  maxRounds: number;
  createDate: Date;
  typeTournament: TypeTournament;
  store: Store;
}

export interface TournamentImage {
  id: string;
  url: string;
  alt: string;
}

export interface TypeTournament {
  id: string;
  name: string;
}

export interface StoreTournament {
  id: string;
  name: string;
  lat: number;
  lgn: number;
}

export interface TournamentInterface {
  id: string;
  title: string;
  description: string;
  url: string;
  lat: number;
  lgn: number;
  format: string;
  date: Date;
  image: string;
  currentRoundNumber: number;
  maxRounds: number;
  createDate: Date;
  storeId: string;
  typeTournamentId: string;
  tournamentPlayers: TournamentPlayerInterface[];
  tournamentRounds: RoundInterface[];
}

export interface TournamentPlayerInterface {
  id: string;
  userId: string;
  playerNickname: string;
  name?: string;
  lastname?: string;
  image?: string;
  points: number;
  pointsInitial: number;
  hadBye: boolean;
  buchholz: number;
  rivals: string[];
}

export interface MatchInterface {
  id: string;
  player1Id: string;
  player1Nickname: string;
  player2Id: string | null;
  player2Nickname: string | null;
  result: "P1" | "P2" | "DRAW" | null;
}

export interface RoundInterface {
  id: string;
  roundNumber: number;
  startedAt: string | null;
  matches: MatchInterface[];
}

export interface TournamentSnapshot {
  tournament: {
    id: string;
    title: string;
    status: "pending" | "in_progress" | "finished" | "cancelled";
    currentRoundNumber: number;
  };
  players: TournamentPlayerInterface[];
  rounds: RoundInterface[];
}

export interface ActiveTournamentData {
  currentUserId: string;
  inProgressCount: number;
  lastTournament: TournamentSnapshot | null;
  currentTournament: TournamentSnapshot | null;
}

// Match previo usado SOLO para saber cuántas rondas existen.
export interface SwissMatchMinimal {
  id: string;
}

export interface GenerateRoundInterface {
  tournamentId: string;
  players: TournamentPlayerInterface[];
  currentRoundNumber: number;
  maxRounds: number;
}

export interface UserSummaryInterface {
  id: string;
  nickname: string;
  name?: string | null;
  lastname?: string | null;
  image?: string | null;
}
