import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ENCODED_SECTION_SEPARATOR, parseEncodedDeckSegment } from "@/utils/decklist";
import { verifySimulatorToken } from "@/lib/simulator-token";

export const runtime = "nodejs";

const getToken = (request: Request) => request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";

export async function GET(request: Request) {
  const session = verifySimulatorToken(getToken(request));
  if (!session) return NextResponse.json({ error: "Token de simulador inválido." }, { status: 401 });

  const decks = await prisma.deck.findMany({
    where: {
      userId: session.userId,
      cardsNumber: { gte: 40 },
      AND: [{ OR: [{ isAdminDeck: false }, { isAdminDeck: { isSet: false } }] }],
    },
    select: { id: true, name: true, cards: true, cardsNumber: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    decks: decks.map((deck) => {
      const [mainSegment = "", limboSegment = ""] = deck.cards.split(ENCODED_SECTION_SEPARATOR);
      return {
        id: deck.id,
        name: deck.name,
        mainDeck: parseEncodedDeckSegment(mainSegment).map(({ key, count }) => ({ cardId: key, count })),
        limboDeck: parseEncodedDeckSegment(limboSegment).map(({ key, count }) => ({ cardId: key, count })),
        mainDeckCount: deck.cardsNumber,
      };
    }),
  });
}
