export interface PublicPlayerRankingItem {
  id: string;
  rank: number;
  nickname: string;
  name: string;
  lastname: string;
  image: string;
  city: string | null;
  storeName: string | null;
  eloPoints: number;
  matchesPlayed: number;
  tournamentsPlayed: number;
  winrate: number;
}
