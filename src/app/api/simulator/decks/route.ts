import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { simulatorCorsHeaders, simulatorOptionsResponse } from "@/lib/simulator-cors";
import { toSimulatorDeckDto } from "@/lib/simulator-deck";
import { verifySimulatorToken } from "@/lib/simulator-token";

export const runtime = "nodejs";

const getToken = (request: Request) => request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";

export async function OPTIONS(request: Request) {
  return simulatorOptionsResponse(request, "GET, OPTIONS");
}

export async function GET(request: Request) {
  const headers = simulatorCorsHeaders(request.headers.get("origin"));
  const session = verifySimulatorToken(getToken(request));
  if (!session) return NextResponse.json({ error: "Token de simulador invalido." }, { status: 401, headers });

  const decks = await prisma.deck.findMany({
    where: {
      userId: session.userId,
      cardsNumber: { gte: 40 },
      AND: [{ OR: [{ isAdminDeck: false }, { isAdminDeck: { isSet: false } }] }],
    },
    select: { id: true, name: true, cards: true, userId: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ decks: decks.map(toSimulatorDeckDto) }, { headers });
}
