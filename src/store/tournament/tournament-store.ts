import { create } from "zustand";
import {
  getTournamentAction,
  addPlayerAction,
  generateRoundAction,
  saveMatchResultAction,
  finalizeRoundAction,
  finalizeTournamentAction,
  deletePlayerAction,
} from "@/actions";
import { applySwissResults, calculateBuchholzForPlayers } from "@/logic";
import { TournamentPlayerInterface, RoundInterface } from "@/interfaces";

// Types locales
export type BasicTournament = {
  id: string;
  title: string;
  descripcion?: string | null;
  date: string;
  status: "pending" | "in_progress" | "finished";
  currentRoundNumber: number;
  maxRounds: number;
};

type TournamentStoreState = {
  tournamentId: string | null;
  tournament: BasicTournament | null;
  players: TournamentPlayerInterface[];
  rounds: RoundInterface[];
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
    result: "P1" | "P2" | "DRAW",
    player2Nickname: string | null
  ) => Promise<void>;
  finalizeRound: () => Promise<void>;
  finalizeTournament: () => Promise<void>;
  deletePlayer: (playerId: string) => Promise<boolean>;
};

export const useTournamentStore = create<TournamentStoreState>((set, get) => ({
  tournamentId: null,
  tournament: null as BasicTournament | null,
  players: [] as TournamentPlayerInterface[],
  rounds: [] as RoundInterface[],
  loading: false,
  error: null,

  setTournamentId: (id: string) => set({ tournamentId: id }),

  fetchTournament: async (id?: string) => {
    const tournamentId = id ?? get().tournamentId;
    if (!tournamentId) return;

    try {
      set({ loading: true, error: null });
      console.log("Cargando torneo...", new Date());
      const data = await getTournamentAction(tournamentId);

      console.log("Torneo cargado.", new Date());
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
          currentRoundNumber: data.currentRoundNumber,
          maxRounds: data.maxRounds,
        },
        players: data.tournamentPlayers.map((p) => ({
          id: p.id,
          userId: p.userId,
          playerNickname: p.playerNickname,
          points: p.points,
          pointsInitial: p.pointsInitial,
          buchholz: p.buchholz,
          hadBye: p.hadBye,
          rivals: p.rivals,
        })),

        rounds: data.tournamentRounds.map((r) => ({
          id: r.id,
          roundNumber: r.roundNumber,
          matches: r.matches.map((m) => ({
            id: m.id,
            player1Id: m.player1Id,
            player2Id: m.player2Id,
            player1Nickname: m.player1Nickname,
            player2Nickname: m.player2Nickname,
            result: m.result,
          })),
        })),

        loading: false,
      });

      console.log("Torneo almacenado en store.", new Date());
    } catch (error) {
      console.error(error);
      set({ loading: false, error: "Error cargando el torneo" });
    }
  },

  addPlayerByUserId: async (
    userId: string,
    playerNickname: string,
    pointsInitial: number = 0
  ) => {
    const { tournamentId } = get();
    if (!tournamentId) return;

    const newPlayer = await addPlayerAction({
      tournamentId,
      userId,
      playerNickname,
      pointsInitial,
    });

    set({
      players: [
        ...get().players,
        {
          id: newPlayer.id,
          userId,
          playerNickname,
          points: pointsInitial,
          pointsInitial,
          hadBye: false,
          buchholz: 0,
          rivals: [],
        },
      ],
    });
  },

  generateRound: async () => {
    const state = get();
    const tournamentId = state.tournamentId;
    if (!tournamentId || !state.tournament) return;

    try {
      // Llamada al action
      const apiRound = await generateRoundAction({
        tournamentId,
        players: state.players,
        currentRoundNumber: state.tournament.currentRoundNumber,
        maxRounds: state.tournament.maxRounds,
      });

      // Construir la ronda usando swissRound + matchIds
      const newRound: RoundInterface = {
        id: apiRound.roundId,
        roundNumber: apiRound.swissRound.number,
        matches: apiRound.swissRound.matches.map((m, index) => {
          const matchId = apiRound.matchIds[index];

          return {
            id: matchId,
            player1Id: m.player1.id,
            player2Id: m.player2?.id ?? null,
            player1Nickname: m.player1.playerNickname,
            player2Nickname: m.player2?.playerNickname ?? "BYE",
            result: m.player2 ? null : "P1",
          };
        }),
      };

      // Actualizar store
      set((state) => ({
        rounds: [...state.rounds, newRound],
        tournament: state.tournament
          ? {
              ...state.tournament,
              status: "in_progress",
              maxRounds: apiRound.maxRounds,
            }
          : null,
      }));
    } catch (error) {
      console.error(error);
      set({ error: "Error generando la ronda" });
    }
  },

  saveMatchResult: async (matchId, result, player2Nickname) => {
    if (!matchId) return;

    const state = get();
    if (
      state.tournament?.status === "finished" ||
      player2Nickname === null ||
      player2Nickname === "BYE"
    )
      return;

    // actualización segura usando la versión más reciente del estado
    set((state) => {
      const currentRound = state.rounds[state.rounds.length - 1];

      return {
        rounds: [
          ...state.rounds.slice(0, -1),
          {
            ...currentRound,
            matches: currentRound.matches.map((m) =>
              m.id === matchId ? { ...m, result } : m
            ),
          },
        ],
      };
    });

    try {
      await saveMatchResultAction(matchId, result, player2Nickname);
    } catch (error) {
      console.error(error);
      set({ error: "Error guardando resultado" });
    }
  },

  finalizeRound: async () => {
    const snapshot = get();
    if (!snapshot.tournament) return;

    const round = snapshot.rounds[snapshot.rounds.length - 1];

    try {
      // aplicar resultados Swiss
      console.log("Aplicando resultados suizos...", new Date());
      applySwissResults(round, snapshot.players);

      console.log("Calcular buchholz...", new Date());
      // calcular buchholz
      const updatedPlayers = calculateBuchholzForPlayers(snapshot.players);

      console.log("Finalizando ronda en backend...", new Date());

      set((state) => ({
        players: updatedPlayers,
        tournament: {
          ...state.tournament!,
          currentRoundNumber: state.tournament!.currentRoundNumber + 1,
        },
      }));

      // actualizar backend
      await finalizeRoundAction(snapshot.tournament.id, round, updatedPlayers);

      console.log("Actualizando store...", new Date());
      // actualización segura usando la versión más reciente del estado

      // Usar seimpre la versión más reciente del store
      const after = get();

      console.log("Generando siguiente ronda si aplica...", new Date());
      // generar automáticamente la siguiente ronda si no es la última
      if (after.tournament!.currentRoundNumber < after.tournament!.maxRounds) {
        await after.generateRound();
      }

      console.log("Ronda finalizada.", new Date());
    } catch (error) {
      console.error(error);
      set({ error: "Error finalizando la ronda" });
    }
  },

  finalizeTournament: async () => {
    const state = get();
    if (!state.tournamentId) return;

    try {
      await finalizeTournamentAction(state.tournamentId);

      set((state) => ({
        tournament: state.tournament
          ? { ...state.tournament, status: "finished" }
          : null,
      }));
    } catch (error) {
      console.error(error);
      set({ error: "Error finalizando el torneo" });
    }
  },

  deletePlayer: async (playerId: string) => {
    const { tournamentId } = get();
    if (!tournamentId) return false;

    try {
      await deletePlayerAction(playerId);

      set({
        players: get().players.filter((p) => p.id !== playerId),
      });

      return true;
    } catch (error) {
      console.error(error);

      set({
        players: get().players,
        error: "Error eliminando jugador",
      });

      return false;
    }
  },
}));
