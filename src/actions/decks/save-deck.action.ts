"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuthError } from "next-auth";
import { SaveDeckSchema, type SaveDeckInput } from "@/schemas";
import { isEncodedDecklist, normalizeEncodedDecklist } from "@/utils/decklist";

const MAX_TOURNAMENT_DECK_EDIT_DAYS = 7;

export async function saveDeck(input: SaveDeckInput) {
  const session = await auth();

  try {
    const data = SaveDeckSchema.parse(input);
    const isAdminDeck = data.isAdminDeck === true;
    const normalizedDeckList = normalizeEncodedDecklist(data.deckList);

    if (!session) {
      return {
        success: false,
        message:
          "No tienes una sesi\u00f3n activa. Por favor, inicia sesi\u00f3n para continuar",
      };
    }

    if (!session.user.idd) {
      return {
        success: false,
        message:
          "Error en la sesi\u00f3n activa. Por favor, vuelva a iniciar sesi\u00f3n para continuar",
      };
    }

    if (!isAdminDeck && data.visible && data.cardsNumber < 40) {
      return {
        success: false,
        message:
          "Para publicar un mazo debe tener 40 cartas en el mazo principal.",
      };
    }

    if (isAdminDeck && session.user.role !== "admin") {
      return {
        success: false,
        message: "No tienes permisos para crear este tipo de mazo.",
      };
    }

    if (!isEncodedDecklist(normalizedDeckList)) {
      return {
        success: false,
        message:
          "El formato del codigo del mazo no es valido. Reabre el laboratorio y vuelve a intentarlo.",
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
        existingDeck.userId === session.user.idd ||
        (session.user.role === "admin" && existingDeck.isAdminDeck);

      if (!canEdit) {
        return {
          success: false,
          message: "No tienes permisos para editar este mazo.",
        };
      }

      if (existingDeck) {
        let resolvedVisible = data.visible;
        const nextIsAdminDeck = existingDeck.isAdminDeck || isAdminDeck;

        if (nextIsAdminDeck) {
          // Los mazos admin siempre se guardan privados.
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
            // En Tier 1/2 el mazo asociado queda bloqueado desde la asociacion.
            return {
              success: false,
              message:
                "No puedes editar este mazo porque está asociado a un torneo competitivo.",
            };
          } else {
            const canEditDuring =
              tournament.status === "pending" ||
              tournament.status === "in_progress";
            const canEditAfterFinish =
              tournament.status === "finished" &&
              tournament.finishedAt instanceof Date &&
              (() => {
                // Respeta la ventana de 7 dias despues de finalizar en Tier 3.
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
          }

          // En mazos de torneo la visibilidad se fuerza segun el estado.
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
            visible: resolvedVisible,
            cardsNumber: data.cardsNumber,
            isAdminDeck: nextIsAdminDeck,
          },
        });
        return { success: true };
      }
    }

    if (!isAdminDeck) {
      // verificar si existe el usuario en la base de datos
      const decksNumber = await prisma.deck.count({
        where: {
          userId: session.user.idd,
          // Solo se consideran los mazos que no esten asociados a un torneo.
          OR: [{ tournamentId: null }, { tournamentId: { isSet: false } }],
        },
      });

      if (decksNumber >= 12) {
        return { success: false, message: "Limite de 12 mazos alcanzado" };
      }
    }

    const createdDeck = await prisma.deck.create({
      data: {
        userId: session.user.idd,
        name: data.name,
        description: data.description,
        archetypeId: data.archetypesId,
        imagen: data.imgDeck,
        cards: normalizedDeckList,
        visible: isAdminDeck ? false : data.visible,
        cardsNumber: data.cardsNumber,
        isAdminDeck,
      },
    });
    return { success: true, deckId: createdDeck.id };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message };
    }
    return { error: "error 500" };
  }
}
