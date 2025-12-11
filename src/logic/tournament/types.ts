import { TournamentPlayerInterface } from "@/interfaces";

export type SwissMatch = {
  player1: TournamentPlayerInterface;
  player2: TournamentPlayerInterface | null; // BYE
  result?: "P1" | "P2" | "DRAW";
};

export type SwissRound = {
  number: number;
  matches: SwissMatch[];
};
