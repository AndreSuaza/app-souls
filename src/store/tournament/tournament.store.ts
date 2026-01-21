import { create } from "zustand";
import {
  getTournamentAction,
  addPlayerAction,
  generateRoundAction,
  recalculateRoundAction,
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
  status: "pending" | "in_progress" | "finished" | "cancelled";
  currentRoundNumber: number;
  maxRounds: number;
  format?: string;
  typeTournamentName?: string;
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
    pointsInitial?: number,
  ) => Promise<void>;

  generateRound: () => Promise<void>;
  saveMatchResult: (
    matchId: string,
    result: "P1" | "P2" | "DRAW",
    player2Nickname: string | null,
  ) => Promise<void>;
  finalizeRound: () => Promise<void>;
  finalizeTournament: () => Promise<void>;
  deletePlayer: (playerId: string) => Promise<boolean>;
  editRoundResults: (
    roundNumber: number,
    updatedMatches: MatchInterface[],
  ) => Promise<void>;
  startCurrentRound: () => Promise<void>;
  recalculateCurrentRound: () => Promise<boolean>;
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
          typeTournamentName: data.typeTournament?.name ?? undefined,
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
    pointsInitial: number = 0,
  ) => {
    const { tournamentId, tournament } = get();
    if (!tournamentId || !tournament) return;
    if (tournament.status === "finished") {
      // Evita registros cuando el torneo ya finalizo.
      set({
        error: "El torneo ya finalizo, no se pueden registrar jugadores.",
      });
      throw new Error(
        "El torneo ya finalizo, no se pueden registrar jugadores.",
      );
    }

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

    const after = get();
    const currentRound = after.rounds[after.rounds.length - 1];
    const shouldRecalculate =
      after.tournament?.status === "in_progress" &&
      currentRound &&
      !currentRound.startedAt &&
      currentRound.roundNumber === after.tournament.currentRoundNumber + 1;

    // Recalcula emparejamientos si se agrega un jugador antes de iniciar la ronda.
    if (shouldRecalculate) {
      await after.recalculateCurrentRound();
    }
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
              m.id === matchId ? { ...m, result } : m,
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
      applySwissResults(round, snapshot.players);

      // calcular buchholz
      const updatedPlayers = calculateBuchholzForPlayers(snapshot.players);

      set((state) => ({
        players: updatedPlayers,
        tournament: {
          ...state.tournament!,
          currentRoundNumber: state.tournament!.currentRoundNumber + 1,
        },
      }));

      // actualizar backend
      await finalizeRoundAction(snapshot.tournament.id, round, updatedPlayers);

      // Usar seimpre la versión más reciente del store
      const after = get();

      // generar automáticamente la siguiente ronda si no es la última
      if (after.tournament!.currentRoundNumber < after.tournament!.maxRounds) {
        await after.generateRound();
      }
    } catch (error) {
      console.error(error);
      set({ error: "Error finalizando la ronda" });
    }
  },

  finalizeTournament: async () => {
    const state = get();
    if (!state.tournamentId) return;

    try {
      // Construye el mapa playerId -> userId para contar victorias por usuario.
      const playerIdToUserId = new Map(
        state.players.map((p) => [p.id, p.userId]),
      );
      // Inicializa los contadores en 0 para todos los inscritos.
      const winsByUserId = new Map(state.players.map((p) => [p.userId, 0]));

      // Suma 1 victoria por match ganado (P1/P2); empates no cuentan.
      state.rounds.forEach((round) => {
        round.matches.forEach((match) => {
          if (match.result === "P1") {
            const userId = playerIdToUserId.get(match.player1Id);
            if (userId) {
              winsByUserId.set(userId, (winsByUserId.get(userId) ?? 0) + 1);
            }
          }

          if (match.result === "P2" && match.player2Id) {
            const userId = playerIdToUserId.get(match.player2Id);
            if (userId) {
              winsByUserId.set(userId, (winsByUserId.get(userId) ?? 0) + 1);
            }
          }
        });
      });

      // Genera el payload minimo para actualizar puntos y torneos jugados.
      const players = state.players.map((p) => ({
        userId: p.userId,
        wins: winsByUserId.get(p.userId) ?? 0,
      }));

      // Actualiza el torneo y los usuarios en el backend.
      await finalizeTournamentAction({
        tournamentId: state.tournamentId,
        players,
      });

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
      const state = get();
      const currentRound = state.rounds[state.rounds.length - 1];
      // Solo se ajusta el match si la ronda actual existe y no ha sido finalizada.
      const roundIsOpen =
        currentRound?.matches.some((m) => m.result === null) ?? false;

      let matchDeleteId: string | null = null;
      let matchUpdate: {
        id: string;
        player1Id: string;
        player1Nickname: string;
        player2Id: string | null;
        player2Nickname: string | null;
        result: "P1" | "P2" | "DRAW" | null;
      } | null = null;

      if (currentRound && roundIsOpen) {
        // Buscar el match donde participa el jugador a eliminar.
        const match = currentRound.matches.find(
          (m) => m.player1Id === playerId || m.player2Id === playerId,
        );

        if (match) {
          // Si el match ya tiene BYE, se elimina; si no, se convierte a BYE.
          const hasBye =
            match.player2Id === null || match.player2Nickname === "BYE";

          if (hasBye) {
            matchDeleteId = match.id;
          } else if (match.player2Id === playerId) {
            matchUpdate = {
              id: match.id,
              player1Id: match.player1Id,
              player1Nickname: match.player1Nickname,
              player2Id: null,
              player2Nickname: "BYE",
              result: "P1",
            };
          } else {
            matchUpdate = {
              id: match.id,
              player1Id: match.player2Id ?? match.player1Id,
              player1Nickname: match.player2Nickname ?? match.player1Nickname,
              player2Id: null,
              player2Nickname: "BYE",
              result: "P1",
            };
          }
        }
      }

      // Ejecuta la eliminacion en BD con la informacion ya calculada.
      await deletePlayerAction({
        playerId,
        matchDeleteId,
        matchUpdate,
      });

      set({
        players: get().players.filter((p) => p.id !== playerId),
      });

      if (currentRound && (matchDeleteId || matchUpdate)) {
        // Actualiza el store sin depender de la respuesta del backend.
        set((state) => ({
          rounds: state.rounds.map((round) => {
            if (round.id !== currentRound.id) return round;

            if (matchDeleteId) {
              return {
                ...round,
                matches: round.matches.filter((m) => m.id !== matchDeleteId),
              };
            }

            if (matchUpdate) {
              return {
                ...round,
                matches: round.matches.map((m) =>
                  m.id === matchUpdate!.id
                    ? {
                        ...m,
                        player1Id: matchUpdate!.player1Id,
                        player1Nickname: matchUpdate!.player1Nickname,
                        player2Id: matchUpdate!.player2Id,
                        player2Nickname: matchUpdate!.player2Nickname,
                        result: matchUpdate!.result,
                      }
                    : m,
                ),
              };
            }

            return round;
          }),
        }));
      }

      const after = get();
      const recalculationRound = after.rounds[after.rounds.length - 1];
      const shouldRecalculate =
        after.tournament?.status === "in_progress" &&
        recalculationRound &&
        !recalculationRound.startedAt &&
        recalculationRound.roundNumber ===
          after.tournament.currentRoundNumber + 1;

      // Recalcula la ronda actual si se elimina un jugador antes de iniciarla.
      if (shouldRecalculate) {
        await after.recalculateCurrentRound();
      }

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
    updatedMatches: MatchInterface[],
  ) => {
    const state = get();
    const { tournamentId } = state;
    if (!tournamentId) return;

    // Encontrar la ronda
    const roundIndex = state.rounds.findIndex(
      (round) => round.roundNumber === roundNumber,
    );
    if (roundIndex === -1) return;

    const currentRound = state.rounds[roundIndex];

    // Copia mutable de players para aplicar cambios incrementales
    const playersMap = new Map(state.players.map((p) => [p.id, { ...p }]));

    // Recorrer SOLO los matchs editados
    updatedMatches.forEach((updatedMatch) => {
      if (updatedMatch.player2Id === null) return;

      const oldMatch = currentRound.matches.find(
        (m) => m.id === updatedMatch.id,
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
        idx === roundIndex ? { ...round, matches: updatedMatches } : round,
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

  recalculateCurrentRound: async () => {
    const state = get();
    const { tournamentId, tournament } = state;
    const currentRound = state.rounds[state.rounds.length - 1];
    if (!tournamentId || !tournament || !currentRound) return false;

    try {
      const apiRound = await recalculateRoundAction({
        tournamentId,
        roundId: currentRound.id,
        players: state.players,
        currentRoundNumber: tournament.currentRoundNumber,
      });

      const updatedRound: RoundInterface = {
        id: currentRound.id,
        roundNumber: apiRound.swissRound.number,
        startedAt: null, // Reinicia la ronda para permitir un nuevo inicio.
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

      // Actualiza solo la ronda actual sin reconsultar la base de datos.
      set((state) => ({
        rounds: [...state.rounds.slice(0, -1), updatedRound],
      }));
      return true;
    } catch (error) {
      console.error(error);
      set({ error: "Error recalculando la ronda" });
      return false;
    }
  },

  deleteTournament: async () => {
    const { tournamentId, tournament } = get();
    if (!tournamentId) return false;

    if (
      tournament?.status === "finished" ||
      tournament?.status === "cancelled"
    ) {
      return false;
    }

    try {
      await deleteTournamentAction(
        tournamentId,
        tournament?.status ?? "pending",
      );

      set({
        tournament: tournament ? { ...tournament, status: "cancelled" } : null,
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
