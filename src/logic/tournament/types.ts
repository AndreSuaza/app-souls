export type SwissPlayer = {
  id: string;
  nickname: string;
  points: number;
  rivals: string[];
  hadBye: boolean;
};

export type SwissMatch = {
  player1: SwissPlayer;
  player2: SwissPlayer | null; // BYE
  result?: "P1" | "P2" | "DRAW";
};

export type SwissRound = {
  number: number;
  matches: SwissMatch[];
};
