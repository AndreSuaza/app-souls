import { create } from "zustand";
import {
  getTournament,
  addPlayer,
  generateRound,
  saveMatchResult,
  finalizeRound,
  finalizeTournament,
  deletePlayer,
} from "@/actions";

// Types locales
export type BasicTournament = {
  id: string;
  title: string;
  descripcion?: string | null;
  date: string;
  status: string;
  maxRounds: number;
};

export type Player = {
  id: string;
  userId: string;
  playerNickname: string;
  points: number;
  buchholz: number;
};

export type Match = {
  id: string;
  player1Id: string | null;
  player2Id: string | null;
  player1Nickname: string | null;
  player2Nickname: string | null;
  result: "P1" | "P2" | "DRAW" | null;
  status: string;
};

export type Round = {
  id: string;
  roundNumber: number;
  status: string;
  matches: Match[];
};

type TournamentStoreState = {
  tournamentId: string | null;
  tournament: BasicTournament | null;
  players: Player[];
  rounds: Round[];
  loading: boolean;
  error: string | null;

  setTournamentId: (id: string) => void;
  fetchTournament: (id?: string) => Promise<void>;

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
  tournament: null as BasicTournament | null,
  players: [] as Player[],
  rounds: [] as Round[],
  loading: false,
  error: null,

  setTournamentId: (id: string) => set({ tournamentId: id }),

  fetchTournament: async (id?: string) => {
    const tournamentId = id ?? get().tournamentId;
    if (!tournamentId) return;

    try {
      set({ loading: true, error: null });
      const data = await getTournament(tournamentId);

      if (!data) {
        set({ loading: false, error: "Torneo no encontrado" });
        return;
      }

      set({
        tournamentId,
        tournament: {
          id: data.id,
          title: data.title,
          descripcion: data.descripcion,
          date: data.date.toISOString(),
          status: data.status,
          maxRounds: data.maxRounds,
        },
        players: data.tournamentPlayers.map((p) => ({
          id: p.id,
          userId: p.userId,
          playerNickname: p.playerNickname,
          points: p.points,
          buchholz: p.buchholz,
        })),

        rounds: data.tournamentRounds.map((r) => ({
          id: r.id,
          roundNumber: r.roundNumber,
          status: r.status,
          matches: r.matches.map((m) => ({
            id: m.id,
            player1Id: m.player1Id,
            player2Id: m.player2Id,
            player1Nickname: m.player1Nickname,
            player2Nickname: m.player2Nickname,
            result: m.result,
            status: m.status,
          })),
        })),

        loading: false,
      });
    } catch (error) {
      console.error(error);
      set({ loading: false, error: "Error cargando el torneo" });
    }
  },

  addPlayerByUserId: async (
    userId: string,
    nickname: string,
    pointsInitial: number = 0
  ) => {
    const { tournamentId } = get();
    if (!tournamentId) return;

    const newPlayer = await addPlayer({
      tournamentId,
      userId,
      nickname,
      pointsInitial,
    });

    set({
      players: [...get().players, newPlayer],
    });
  },

  generateRound: async () => {
    const { tournamentId } = get();
    if (!tournamentId) return;

    try {
      const apiRound = await generateRound(tournamentId);
      const players = get().players;

      const newRound: Round = {
        id: apiRound.id,
        roundNumber: apiRound.roundNumber,
        status: apiRound.status,
        matches: apiRound.matches.map((m: any) => {
          const p1 = players.find((p) => p.id === m.player1Id);
          const p2 = players.find((p) => p.id === m.player2Id);

          return {
            id: m.id,
            player1Id: m.player1Id,
            player2Id: m.player2Id,
            player1Nickname: p1?.playerNickname ?? null,
            player2Nickname: p2?.playerNickname ?? null,
            result: m.result,
            status: m.status,
          };
        }),
      };

      set({
        rounds: [...get().rounds, newRound],
      });
    } catch (error) {
      console.error(error);
      set({ error: "Error generando la ronda" });
    }
  },

  // Marcamos el match como "in_progress" en la UI antes de guardar en servidor.
  // Si el servidor falla, recargamos los datos reales con fetchTournament().
  saveMatchResult: async (matchId, result) => {
    // Actualización optimista
    set({
      rounds: get().rounds.map((r) => ({
        ...r,
        matches: r.matches.map((m) =>
          m.id === matchId ? { ...m, result, status: "in_progress" } : m
        ),
      })),
    });

    try {
      await saveMatchResult({ matchId, result });

      // Actualización final tras éxito
      set({
        rounds: get().rounds.map((r) => ({
          ...r,
          matches: r.matches.map((m) =>
            m.id === matchId ? { ...m, result, status: "finished" } : m
          ),
        })),
      });
    } catch (error) {
      console.error(error);
      set({ error: "Error guardando resultado" });
    }
  },

  finalizeRound: async (roundId: string) => {
    const { tournamentId } = get();
    if (!tournamentId) return;

    try {
      await finalizeRound(roundId, tournamentId);

      set({
        rounds: get().rounds.map((r) =>
          r.id === roundId ? { ...r, status: "finished" } : r
        ),
      });
    } catch (error) {
      console.error(error);
      set({ error: "Error finalizando la ronda" });
    }
  },

  finalizeTournament: async () => {
    const { tournamentId } = get();
    if (!tournamentId) return;

    try {
      await finalizeTournament(tournamentId);

      set({
        tournament: get().tournament
          ? { ...get().tournament!, status: "finished" }
          : null,
      });
    } catch (error) {
      console.error(error);
      set({ error: "Error finalizando el torneo" });
    }
  },

  deletePlayer: async (playerId: string) => {
    const { tournamentId } = get();
    if (!tournamentId) return;

    try {
      const previousPlayers = get().players;

      set({
        players: previousPlayers.filter((p) => p.id !== playerId),
      });

      await deletePlayer(playerId);
    } catch (error) {
      console.error(error);

      set({
        players: get().players,
        error: "Error eliminando jugador",
      });
    }
  },
}));
