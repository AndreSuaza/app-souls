import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { simulatorCorsHeaders, simulatorOptionsResponse } from "@/lib/simulator-cors";
import { toSimulatorDeckDto } from "@/lib/simulator-deck";
import { verifySimulatorToken } from "@/lib/simulator-token";
import { resolveCardImageUrl } from "@/utils/card-image";

export const runtime = "nodejs";

const getToken = (request: Request) => request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
const mongoObjectIdPattern = /^[a-f\d]{24}$/i;

export async function OPTIONS(request: Request) {
  return simulatorOptionsResponse(request, "GET, OPTIONS");
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = simulatorCorsHeaders(request.headers.get("origin"));
  const session = verifySimulatorToken(getToken(request));
  if (!session) return NextResponse.json({ error: "Token de simulador invalido." }, { status: 401, headers });

  const { id } = await params;
  const deck = await prisma.deck.findFirst({
    where: {
      id,
      userId: session.userId,
      cardsNumber: { gte: 40 },
      AND: [{ OR: [{ isAdminDeck: false }, { isAdminDeck: { isSet: false } }] }],
    },
    select: { id: true, name: true, cards: true, userId: true },
  });

  if (!deck) return NextResponse.json({ error: "Mazo no encontrado." }, { status: 404, headers });

  const parsedDeck = toSimulatorDeckDto(deck);
  const cardKeys = Array.from(
    new Set(
      [...parsedDeck.mainDeck, ...parsedDeck.limboDeck].map(
        (entry) => entry.cardId,
      ),
    ),
  );
  const cardObjectIds = cardKeys.filter((key) =>
    mongoObjectIdPattern.test(key),
  );
  const cards =
    cardKeys.length > 0
      ? await prisma.card.findMany({
          where: {
            OR: [
              { code: { in: cardKeys } },
              ...(cardObjectIds.length > 0
                ? [{ id: { in: cardObjectIds } }]
                : []),
            ],
          },
          select: {
            id: true,
            code: true,
            name: true,
            typeIds: true,
            cost: true,
            force: true,
            defense: true,
            effect: true,
            imageUrl: true,
            idd: true,
          },
        })
      : [];
  const typeIds = Array.from(new Set(cards.flatMap((card) => card.typeIds)));
  const types =
    typeIds.length > 0
      ? await prisma.type.findMany({
          where: { id: { in: typeIds } },
          select: { id: true, name: true },
        })
      : [];
  const typeById = new Map(types.map((type) => [type.id, type]));

  return NextResponse.json(
    {
      deck: toSimulatorDeckDto(
        deck,
        cards.map((card) => ({
          id: card.id,
          code: card.code,
          name: card.name,
          types: card.typeIds.flatMap((typeId) => {
            const type = typeById.get(typeId);
            return type ? [{ name: type.name }] : [];
          }),
          cost: card.cost,
          force: card.force,
          defense: card.defense,
          effect: card.effect,
          imageUrl: resolveCardImageUrl(card),
        })),
      ),
    },
    { headers },
  );
}
