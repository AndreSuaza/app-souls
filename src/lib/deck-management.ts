import { prisma } from "@/lib/prisma";
import {
  DeleteDeckSchema,
  SaveDeckSchema,
  type DeleteDeckInput,
  type SaveDeckInput,
} from "@/schemas";
import {
  ENCODED_SECTION_SEPARATOR,
  hasRawDecklistSeparators,
  isEncodedDecklist,
  normalizeEncodedDecklist,
  parseEncodedDeckSegment,
} from "@/utils/decklist";
import { ZodError } from "zod";

const MAX_TOURNAMENT_DECK_EDIT_DAYS = 7;
const MAX_TOKEN_DECK_CARDS = 10;

export const USER_DECK_LIMIT = 12;

export type DeckManagementUser = {
  idd?: string | null;
  role?: string | null;
};

export type DeckManagementResult = {
  deckId?: string;
  message?: string;
  success: boolean;
};

const normalizeTypeName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const isTokenTypeName = (value: string) => {
  const normalized = normalizeTypeName(value);
  return normalized === "ficha" || normalized === "token";
};

const countEncodedDeckSegment = (segment: string) =>
  parseEncodedDeckSegment(segment).reduce(
    (total, entry) => total + entry.count,
    0,
  );

export const countMainDeckCards = (deckList: string) => {
  const normalizedDeckList = normalizeEncodedDecklist(deckList);
  const [mainSegment = ""] = normalizedDeckList.split(
    ENCODED_SECTION_SEPARATOR,
  );
  return countEncodedDeckSegment(mainSegment);
};

async function validateTokenDeck(rawDecklist?: string | null) {
  const normalized = normalizeEncodedDecklist(rawDecklist ?? "");
  if (!normalized) return { normalized: "", count: 0 };
  if (hasRawDecklistSeparators(normalized)) {
    return {
      error: "El formato del mazo de fichas no es valido.",
      normalized: "",
      count: 0,
    };
  }

  const entries = parseEncodedDeckSegment(normalized);
  const tokenCardsNumber = entries.reduce((acc, entry) => acc + entry.count, 0);

  if (tokenCardsNumber > MAX_TOKEN_DECK_CARDS) {
    return {
      error: "El mazo de fichas no puede superar 10 cartas.",
      normalized: "",
      count: tokenCardsNumber,
    };
  }

  if (entries.length === 0) return { normalized: "", count: 0 };

  const keys = Array.from(new Set(entries.map((entry) => entry.key)));
  const cards = await prisma.card.findMany({
    where: {
      OR: [{ code: { in: keys } }, { idd: { in: keys } }],
    },
    include: {
      types: { select: { name: true } },
    },
  });
  const cardByKey = new Map<string, (typeof cards)[number]>();
  cards.forEach((card) => {
    cardByKey.set(card.code, card);
    cardByKey.set(card.idd, card);
  });

  const invalidEntry = entries.find((entry) => {
    const card = cardByKey.get(entry.key);
    if (!card) return true;
    return !card.types.some((type) => isTokenTypeName(type.name));
  });

  if (invalidEntry) {
    return {
      error: "El mazo de fichas solo acepta cartas de tipo Ficha o Token.",
      normalized: "",
      count: tokenCardsNumber,
    };
  }

  return { normalized, count: tokenCardsNumber };
}

const userIdOrError = (user: DeckManagementUser | null | undefined) => {
  if (!user) {
    return "No tienes una sesión activa. Por favor, inicia sesión para continuar";
  }

  if (!user.idd) {
    return "Error en la sesión activa. Por favor, vuelva a iniciar sesión para continuar";
  }

  return "";
};

export async function saveUserDeck(
  input: SaveDeckInput,
  user: DeckManagementUser | null | undefined,
): Promise<DeckManagementResult> {
  try {
    const sessionError = userIdOrError(user);
    if (sessionError) {
      return { success: false, message: sessionError };
    }
    const userId = user?.idd ?? "";

    const data = SaveDeckSchema.parse(input);
    const isAdminDeck = data.isAdminDeck === true;
    const normalizedDeckList = normalizeEncodedDecklist(data.deckList);
    const mainCardsNumber = Math.max(0, Math.trunc(data.cardsNumber));

    const tokenDeckValidation = await validateTokenDeck(data.tokenDeckList);

    if (tokenDeckValidation.error) {
      return {
        success: false,
        message: tokenDeckValidation.error,
      };
    }

    if (!isAdminDeck && data.visible && mainCardsNumber < 40) {
      return {
        success: false,
        message:
          "Para publicar un mazo debe tener 40 cartas en el mazo principal.",
      };
    }

    if (isAdminDeck && user?.role !== "admin") {
      return {
        success: false,
        message: "No tienes permisos para crear este tipo de mazo.",
      };
    }

    if (!isEncodedDecklist(normalizedDeckList)) {
      return {
        success: false,
        message:
          "El formato del código del mazo no es valido. Reabre el laboratorio y vuelve a intentarlo.",
      };
    }

    if (data.deckId) {
      const existingDeck = await prisma.deck.findUnique({
        where: { id: data.deckId },
        select: {
          id: true,
          userId: true,
          tournamentId: true,
          createdAt: true,
          isAdminDeck: true,
        },
      });

      if (!existingDeck) {
        return { success: false, message: "No se encontro el mazo." };
      }

      const canEdit =
        existingDeck.userId === userId ||
        (user?.role === "admin" && existingDeck.isAdminDeck);

      if (!canEdit) {
        return {
          success: false,
          message: "No tienes permisos para editar este mazo.",
        };
      }

      let resolvedVisible = data.visible;
      const nextIsAdminDeck = existingDeck.isAdminDeck || isAdminDeck;

      if (nextIsAdminDeck) {
        resolvedVisible = false;
      }

      if (existingDeck.tournamentId) {
        const tournament = await prisma.tournament.findUnique({
          where: { id: existingDeck.tournamentId },
          select: {
            status: true,
            finishedAt: true,
            typeTournament: {
              select: { name: true },
            },
          },
        });

        if (!tournament) {
          return {
            success: false,
            message: "No se encontró el torneo asociado.",
          };
        }

        const tournamentTypeName = tournament.typeTournament?.name ?? "";
        const isCompetitiveTier = ["Tier 1", "Tier 2"].includes(
          tournamentTypeName,
        );
        const now = new Date();

        if (isCompetitiveTier) {
          return {
            success: false,
            message:
              "No puedes editar este mazo porque está asociado a un torneo competitivo.",
          };
        }

        const canEditDuring =
          tournament.status === "pending" ||
          tournament.status === "in_progress";
        const canEditAfterFinish =
          tournament.status === "finished" &&
          tournament.finishedAt instanceof Date &&
          (() => {
            const deadline = new Date(tournament.finishedAt);
            deadline.setDate(
              deadline.getDate() + MAX_TOURNAMENT_DECK_EDIT_DAYS,
            );
            return now <= deadline;
          })();

        if (!canEditDuring && !canEditAfterFinish) {
          return {
            success: false,
            message:
              "Ya no puedes editar este mazo porque superaste el tiempo permitido.",
          };
        }

        resolvedVisible = tournament.status === "finished";
      }

      await prisma.deck.update({
        where: { id: existingDeck.id },
        data: {
          name: data.name,
          description: data.description,
          archetypeId: data.archetypesId,
          imagen: data.imgDeck,
          cards: normalizedDeckList,
          tokenCards: tokenDeckValidation.normalized || null,
          visible: resolvedVisible,
          cardsNumber: mainCardsNumber,
          tokenCardsNumber: tokenDeckValidation.count,
          isAdminDeck: nextIsAdminDeck,
        },
      });
      return { success: true, deckId: existingDeck.id };
    }

    if (!isAdminDeck) {
      const decksNumber = await prisma.deck.count({
        where: {
          userId,
          AND: [
            {
              OR: [{ tournamentId: null }, { tournamentId: { isSet: false } }],
            },
            {
              OR: [{ isAdminDeck: false }, { isAdminDeck: { isSet: false } }],
            },
          ],
        },
      });

      if (decksNumber >= USER_DECK_LIMIT) {
        return { success: false, message: "Limite de 12 mazos alcanzado" };
      }
    }

    const createdDeck = await prisma.deck.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        archetypeId: data.archetypesId,
        imagen: data.imgDeck,
        cards: normalizedDeckList,
        tokenCards: tokenDeckValidation.normalized || null,
        visible: isAdminDeck ? false : data.visible,
        cardsNumber: mainCardsNumber,
        tokenCardsNumber: tokenDeckValidation.count,
        isAdminDeck,
      },
    });
    return { success: true, deckId: createdDeck.id };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message:
          error.issues[0]?.message ??
          "Los datos del mazo no cumplen con la validacion requerida.",
      };
    }

    console.error("[saveUserDeck]", error);

    return {
      success: false,
      message: "No se pudo guardar el mazo. Intentalo nuevamente.",
    };
  }
}

export async function deleteUserDeck(
  input: DeleteDeckInput,
  user: DeckManagementUser | null | undefined,
) {
  const sessionError = userIdOrError(user);
  if (sessionError) {
    throw new Error(sessionError);
  }
  const userId = user?.idd ?? "";

  const parsed = DeleteDeckSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Datos invalidos.");
  }

  const { deckId } = parsed.data;

  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
    },
    select: {
      id: true,
      tournamentId: true,
      createdAt: true,
      userId: true,
      isAdminDeck: true,
    },
  });

  if (!deck) {
    throw new Error("No se encontro el mazo.");
  }

  const isAdmin = user?.role === "admin";
  const canManage = deck.userId === userId || (isAdmin && deck.isAdminDeck);

  if (!canManage) {
    throw new Error("No tienes permisos para eliminar este mazo.");
  }

  if (deck.tournamentId) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: deck.tournamentId },
      select: {
        status: true,
        finishedAt: true,
        typeTournament: {
          select: { name: true },
        },
      },
    });

    if (!tournament) {
      throw new Error("No se encontró el torneo asociado.");
    }

    const tournamentTypeName = tournament.typeTournament?.name ?? "";
    const isCompetitiveTier = ["Tier 1", "Tier 2"].includes(tournamentTypeName);
    const now = new Date();

    if (isCompetitiveTier) {
      throw new Error(
        "No puedes eliminar este mazo porque está asociado a un torneo competitivo.",
      );
    }

    const canDeleteDuring =
      tournament.status === "pending" || tournament.status === "in_progress";
    const canDeleteAfterFinish =
      tournament.status === "finished" &&
      tournament.finishedAt instanceof Date &&
      (() => {
        const deadline = new Date(tournament.finishedAt);
        deadline.setDate(deadline.getDate() + MAX_TOURNAMENT_DECK_EDIT_DAYS);
        return now <= deadline;
      })();

    if (!canDeleteDuring && !canDeleteAfterFinish) {
      throw new Error(
        "Ya no puedes eliminar este mazo porque superaste el tiempo permitido.",
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.tournamentPlayer.updateMany({
        where: {
          deckId: deck.id,
          userId,
        },
        data: {
          deckId: null,
        },
      });
      await tx.like.deleteMany({
        where: { deckId: deck.id },
      });
      await tx.deck.delete({
        where: { id: deck.id },
      });
    });

    return { success: true };
  }

  await prisma.$transaction(async (tx) => {
    await tx.like.deleteMany({
      where: { deckId: deck.id },
    });
    await tx.deck.delete({
      where: { id: deck.id },
    });
  });

  return { success: true };
}
