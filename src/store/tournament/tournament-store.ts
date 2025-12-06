import { create } from "zustand";
import {
  getTournament_action,
  addPlayer_action,
  generateRound_action,
  saveMatchResult_action,
  finalizeRound_action,
  finalizeTournament_action,
  deletePlayer_action,
} from "@/actions";
import { TournamentDetail } from "@/interfaces";

// type TournamentPlayer = {
//   id: string;
//   userId: string;
//   playerNickname: string;
//   points: number;
//   rivals: string[];
//   hadBye: boolean;
//   finalRanking?: number;
// };

// type Match = {
//   id: string;
//   player1Id: string;
//   player1Nickname: string;
//   player2Id: string | null;
//   player2Nickname: string | null;
//   result: "P1" | "P2" | "DRAW" | null;
//   status: "pending" | "in_progress" | "finished";
// };

// type Round = {
//   id: string;
//   roundNumber: number;
//   matches: Match[];
//   status: "pending" | "in_progress" | "finished";
// };

// type TournamentDetail = {
//   id: string;
//   title: string;
//   url: string;
//   lat: number;
//   lgn: number;
//   format: string;
//   date: Date;
//   image?: string | null;
//   createDate: Date;
//   storeId: string;
//   typeTournamentId: string;
//   currentRoundNumber: number;
//   maxRounds: number;
//   status: "pending" | "in_progress" | "pending_finalization" | "finished";
//   finalRankingIds?: string[];
//   tournamentPlayers: TournamentPlayer[];
//   tournamentRounds: Round[];
//   descripcion: string;
// };

type TournamentStoreState = {
  tournamentId: string | null;
  tournament: TournamentDetail | null;
  loading: boolean;
  error: string | null;

  setTournamentId: (id: string) => void;
  fetchTournament: (id?: string) => Promise<void>;
  addPlayer: (nickname: string, userId?: string) => Promise<void>;
  addPlayerByUserId: (
    userId: string,
    nickname: string,
    pointsInitial: number
  ) => Promise<void>;
  generateRound: () => Promise<void>;
  saveMatchResult: (
    matchId: string,
    result: "P1" | "P2" | "DRAW"
  ) => Promise<void>;
  finalizeRound: (roundId: string) => Promise<void>;
  finalizeTournament: () => Promise<void>;
  deletePlayer: (playerId: string) => Promise<void>;
};

export const useTournamentStore = create<TournamentStoreState>((set, get) => ({
  tournamentId: null,
  tournament: null,
  loading: false,
  error: null,

  setTournamentId: (id: string) => set({ tournamentId: id }),

  fetchTournament: async (id?: string) => {
    const tournamentId = id ?? get().tournamentId;
    if (!tournamentId) return;

    try {
      set({ loading: true, error: null });
      const data = await getTournament_action(tournamentId);
      set({
        tournamentId,
        tournament: data as TournamentDetail,
        loading: false,
      });
    } catch (error) {
      console.error(error);
      set({ loading: false, error: "Error cargando el torneo" });
    }
  },

  addPlayer: async (nickname: string, userId?: string) => {
    const tournamentId = get().tournamentId;
    if (!tournamentId) return;

    try {
      await addPlayer_action({ tournamentId, userId: userId ?? "", nickname });
      await get().fetchTournament();
    } catch (error) {
      console.error(error);
      set({ error: "Error agregando jugador" });
    }
  },

  addPlayerByUserId: async (
    userId: string,
    nickname: string,
    pointsInitial: number = 0
  ) => {
    const { tournamentId } = get();
    if (!tournamentId) return;

    await addPlayer_action({
      tournamentId,
      userId,
      nickname,
      pointsInitial,
    });

    await get().fetchTournament(tournamentId);
  },

  generateRound: async () => {
    const tournamentId = get().tournamentId;
    if (!tournamentId) return;

    try {
      await generateRound_action({ tournamentId });
      await get().fetchTournament();
    } catch (error) {
      console.error(error);
      set({ error: "Error generando la ronda" });
    }
  },

  // Marcamos el match como "in_progress" en la UI antes de guardar en servidor.
  // Si el servidor falla, recargamos los datos reales con fetchTournament().
  saveMatchResult: async (matchId, result) => {
    // Actualización optimista en el store
    const current = get().tournament;
    if (current) {
      set({
        tournament: {
          ...current,
          tournamentRounds: current.tournamentRounds.map((r) => ({
            ...r,
            matches: r.matches.map((m) =>
              m.id === matchId ? { ...m, result, status: "in_progress" } : m
            ),
          })),
        },
      });
    }

    try {
      await saveMatchResult_action({ matchId, result });
      await get().fetchTournament();
    } catch (error) {
      console.error(error);
      set({ error: "Error guardando resultado" });
      // recargar desde servidor en caso de error para no dejar el optimismo roto
      await get().fetchTournament();
    }
  },

  finalizeRound: async (roundId: string) => {
    const tournamentId = get().tournamentId;
    if (!tournamentId) return;

    try {
      await finalizeRound_action({ roundId, tournamentId });
      await get().fetchTournament();
    } catch (error) {
      console.error(error);
      set({ error: "Error finalizando la ronda" });
    }
  },

  finalizeTournament: async () => {
    const tournamentId = get().tournamentId;
    if (!tournamentId) return;

    try {
      await finalizeTournament_action(tournamentId);
      await get().fetchTournament();
    } catch (error) {
      console.error(error);
      set({ error: "Error finalizando el torneo" });
    }
  },

  deletePlayer: async (playerId: string) => {
    const { tournamentId } = get();
    if (!tournamentId) return;

    await deletePlayer_action(playerId, tournamentId);
    await get().fetchTournament(tournamentId);
  },
}));
