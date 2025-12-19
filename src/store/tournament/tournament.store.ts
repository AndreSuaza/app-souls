import { create } from "zustand";
import {
  getTournamentAction,
  addPlayerAction,
  generateRoundAction,
  saveMatchResultAction,
  finalizeRoundAction,
  finalizeTournamentAction,
  deletePlayerAction,
  editRoundResultsAction,
  startRoundAction,
  deleteTournamentAction,
  updateTournamentInfoAction,
} from "@/actions";
import { applySwissResults, calculateBuchholzForPlayers } from "@/logic";
import {
  TournamentPlayerInterface,
  RoundInterface,
  MatchInterface,
} from "@/interfaces";

// Types locales
export type BasicTournament = {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  status: "pending" | "in_progress" | "finished";
  currentRoundNumber: number;
  maxRounds: number;
  format?: string;
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
    name?: string | null,
    lastname?: string | null,
    image?: string | null,
    pointsInitial?: number
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
  editRoundResults: (
    roundNumber: number,
    updatedMatches: MatchInterface[]
  ) => Promise<void>;
  startCurrentRound: () => Promise<void>;
  deleteTournament: () => Promise<boolean>;
  updateTournamentInfo: (data: {
    title: string;
    description?: string | null;
    date: Date;
  }) => Promise<boolean>;
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

    set({ loading: true, error: null });

    try {
      const data = await getTournamentAction(tournamentId);

      if (!data) {
        set({
          loading: false,
          error: "Torneo no encontrado",
          tournament: null,
          players: [],
          rounds: [],
        });
        return;
      }

      set({
        tournamentId,
        error: null,
        tournament: {
          id: data.id,
          title: data.title,
          description: data.description,
          date: data.date.toISOString(),
          status: data.status,
          currentRoundNumber: data.currentRoundNumber,
          maxRounds: data.maxRounds,
          format: data.format ?? undefined,
        },
        players: data.tournamentPlayers.map((p) => ({
          id: p.id,
          userId: p.userId,
          playerNickname: p.playerNickname,
          name: p.name ?? undefined,
          lastname: p.lastname ?? undefined,
          image: p.image ?? undefined,
          points: p.points,
          pointsInitial: p.pointsInitial,
          buchholz: p.buchholz,
          hadBye: p.hadBye,
          rivals: p.rivals,
        })),

        rounds: data.tournamentRounds.map((r) => ({
          id: r.id,
          roundNumber: r.roundNumber,
          startedAt: r.startedAt ? r.startedAt.toISOString() : null,
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
    } catch (error) {
      console.error(error);
      set({
        error: "Error cargando el torneo",
        tournament: null,
        players: [],
        rounds: [],
      });
    } finally {
      set({ loading: false });
    }
  },

  addPlayerByUserId: async (
    userId: string,
    playerNickname: string,
    name: string | null | undefined,
    lastname: string | null | undefined,
    image: string | null | undefined,
    pointsInitial: number = 0
  ) => {
    const { tournamentId } = get();
    if (!tournamentId) return;

    const newPlayer = await addPlayerAction({
      tournamentId,
      userId,
      playerNickname,
      name: name ?? undefined,
      lastname: lastname ?? undefined,
      image: image ?? undefined,
      pointsInitial,
    });

    set({
      players: [
        ...get().players,
        {
          id: newPlayer.id,
          userId,
          playerNickname,
          name: name ?? undefined,
          lastname: lastname ?? undefined,
          image: image ?? undefined,
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
        startedAt: null, // NO iniciar automáticamente
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

    const currentRound = get().rounds[get().rounds.length - 1];

    if (!currentRound.startedAt) return; // ronda no iniciada

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

  editRoundResults: async (
    roundNumber: number,
    updatedMatches: MatchInterface[]
  ) => {
    const state = get();
    const { tournamentId } = state;
    if (!tournamentId) return;

    // Encontrar la ronda
    const roundIndex = state.rounds.findIndex(
      (round) => round.roundNumber === roundNumber
    );
    if (roundIndex === -1) return;

    const currentRound = state.rounds[roundIndex];

    // Copia mutable de players para aplicar cambios incrementales
    const playersMap = new Map(state.players.map((p) => [p.id, { ...p }]));

    // Recorrer SOLO los matchs editados
    updatedMatches.forEach((updatedMatch) => {
      if (updatedMatch.player2Id === null) return;

      const oldMatch = currentRound.matches.find(
        (m) => m.id === updatedMatch.id
      );

      if (!oldMatch || oldMatch.result === updatedMatch.result) return;

      const player1 = playersMap.get(oldMatch.player1Id);
      const player2 =
        oldMatch.player2Id !== null ? playersMap.get(oldMatch.player2Id) : null;

      if (!player1) return;

      // Revertir puntos anteriores
      switch (oldMatch.result) {
        case "P1":
          player1.points -= 3;
          break;
        case "P2":
          if (player2) player2.points -= 3;
          break;
        case "DRAW":
          player1.points -= 1;
          if (player2) player2.points -= 1;
          break;
      }

      // Aplicar puntos nuevos
      switch (updatedMatch.result) {
        case "P1":
          player1.points += 3;
          break;
        case "P2":
          if (player2) player2.points += 3;
          break;
        case "DRAW":
          player1.points += 1;
          if (player2) player2.points += 1;
          break;
      }
    });

    // Resultado final
    const updatedPlayers = Array.from(playersMap.values());

    // Actualizar store optimistamente
    set((state) => ({
      players: updatedPlayers,
      rounds: state.rounds.map((round, idx) =>
        idx === roundIndex ? { ...round, matches: updatedMatches } : round
      ),
    }));

    // Persistir en DB
    try {
      await editRoundResultsAction({
        matches: updatedMatches,
        players: updatedPlayers,
      });
    } catch (error) {
      console.error(error);
      set({ error: "Error guardando edición de ronda" });
    }
  },

  startCurrentRound: async () => {
    const state = get();
    const currentRound = state.rounds[state.rounds.length - 1];
    if (!currentRound || currentRound.startedAt) return;

    const startedAt = new Date().toISOString();

    // Actualización optimista
    set((state) => ({
      rounds: [
        ...state.rounds.slice(0, -1),
        {
          ...currentRound,
          startedAt,
        },
      ],
    }));

    try {
      await startRoundAction({
        roundId: currentRound.id,
        startedAt: new Date(startedAt),
      });
    } catch (error) {
      console.error(error);
      set({ error: "Error iniciando la ronda" });
    }
  },

  deleteTournament: async () => {
    const { tournamentId, tournament } = get();
    if (!tournamentId) return false;

    if (tournament?.status === "finished") {
      return false;
    }

    try {
      await deleteTournamentAction(
        tournamentId,
        tournament?.status ?? "pending"
      );

      // Limpia el estado local
      set({
        tournament: null,
        players: [],
        rounds: [],
        tournamentId: null,
      });

      return true;
    } catch (error) {
      console.error(error);
      set({ error: "Error cancelando el torneo" });
      return false;
    }
  },

  updateTournamentInfo: async (data) => {
    const { tournamentId, tournament } = get();
    if (!tournamentId || !tournament) return false;

    if (tournament?.status === "finished") {
      return false;
    }

    try {
      await updateTournamentInfoAction({
        tournamentId,
        title: data.title,
        description: data.description ?? undefined,
        date: data.date,
        status: tournament.status ?? "pending",
      });

      // Actualización del store
      set({
        tournament: {
          ...tournament,
          title: data.title,
          description: data.description ?? null,
          date: data.date.toISOString(),
        },
      });

      return true;
    } catch (error) {
      console.error(error);
      set({ error: "Error actualizando información del torneo" });
      return false;
    }
  },
}));
