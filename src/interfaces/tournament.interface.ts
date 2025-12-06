import { Store } from "./store.interface";

export interface Tournament {
  id: string;
  title: string;
  descripcion: string;
  url: string;
  lat: number;
  lgn: number;
  price: number;
  format: string;
  date: Date;
  createDate: Date;
  TournamentImage: TournamentImage[];
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

// Jugador necesario para calcular rondas Swiss.
export interface TournamentPlayerForSwiss {
  id: string;
  playerNickname: string;
  points: number;
  rivals: string[];
  hadBye: boolean;
}

// Match previo usado SOLO para saber cuántas rondas existen.
// No requiere más campos para Swiss en backend.
export interface SwissMatchMinimal {
  id: string;
}

// Ronda previa Swiss
export interface SwissRoundHistory {
  id: string;
  roundNumber: number;
  matches: SwissMatchMinimal[];
}

// Match minimal para procesar resultados en finalizeRound_action
export interface TournamentMatchForProcessing {
  id: string;
  player1Id: string;
  player2Id: string | null;
  player1Nickname: string;
  player2Nickname: string | null;
  result: "P1" | "P2" | "DRAW" | null;
}

// Ronda usada al procesar resultados
export interface TournamentRoundForProcessing {
  id: string;
  matches: TournamentMatchForProcessing[];
}

// DTO usado en acciones (getTournament) y store para enviar datos al front.
export interface TournamentDetail {
  id: string;
  title: string;
  descripcion: string;
  url: string;
  lat: number;
  lgn: number;
  format: string;
  date: Date;
  image?: string | null;
  createDate: Date;
  storeId: string;
  typeTournamentId: string;
  currentRoundNumber: number;
  maxRounds: number;
  status: "pending" | "in_progress" | "pending_finalization" | "finished";
  finalRankingIds?: string[];

  tournamentPlayers: {
    id: string;
    userId: string;
    playerNickname: string;
    points: number;
    pointsInitial: number;
    hadBye: boolean;
    rivals: string[];
    buchholz: number;
    finalRanking?: number;
  }[];

  tournamentRounds: {
    id: string;
    roundNumber: number;
    status: "pending" | "in_progress" | "finished";
    matches: {
      id: string;
      player1Id: string;
      player1Nickname: string;
      player2Id: string | null;
      player2Nickname: string | null;
      result: "P1" | "P2" | "DRAW" | null;
      status: "pending" | "in_progress" | "finished";
      player1Score: number;
      player2Score: number | null;
    }[];
  }[];
}
