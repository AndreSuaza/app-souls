import { NextResponse } from "next/server";
import { countMainDeckCards, saveUserDeck } from "@/lib/deck-management";
import { loadOwnedDeckLabSummaries, loadPlayableSimulatorDecks } from "@/lib/simulator-deck-lab";
import { simulatorCorsHeaders, simulatorOptionsResponse } from "@/lib/simulator-cors";
import { verifySimulatorToken } from "@/lib/simulator-token";
import { normalizeEncodedDecklist, parseEncodedDeckSegment } from "@/utils/decklist";

export const runtime = "nodejs";

const getToken = (request: Request) => request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";

const countTokenDeckCards = (deckList?: string) =>
  parseEncodedDeckSegment(normalizeEncodedDecklist(deckList ?? "")).reduce(
    (total, entry) => total + entry.count,
    0,
  );

export async function OPTIONS(request: Request) {
  return simulatorOptionsResponse(request, "GET, POST, OPTIONS");
}

export async function GET(request: Request) {
  const headers = simulatorCorsHeaders(request.headers.get("origin"));
  const session = verifySimulatorToken(getToken(request));
  if (!session) return NextResponse.json({ error: "Token de simulador invalido." }, { status: 401, headers });

  const decks = await loadOwnedDeckLabSummaries(session);
  return NextResponse.json({ decks }, { headers });
}

export async function POST(request: Request) {
  const headers = simulatorCorsHeaders(request.headers.get("origin"));
  const session = verifySimulatorToken(getToken(request));
  if (!session) return NextResponse.json({ error: "Token de simulador invalido." }, { status: 401, headers });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos de mazo invalidos." }, { status: 400, headers });
  }

  const deckList = typeof body.deckList === "string" ? body.deckList : "";
  const tokenDeckList = typeof body.tokenDeckList === "string" ? body.tokenDeckList : "";
  const result = await saveUserDeck(
    {
      archetypesId: typeof body.archetypesId === "string" ? body.archetypesId : "",
      cardsNumber:
        typeof body.cardsNumber === "number"
          ? Math.max(0, Math.trunc(body.cardsNumber))
          : countMainDeckCards(deckList),
      deckList,
      description: typeof body.description === "string" ? body.description : "",
      imgDeck: typeof body.imgDeck === "string" ? body.imgDeck : "",
      name: typeof body.name === "string" ? body.name : "",
      tokenCardsNumber: countTokenDeckCards(tokenDeckList),
      tokenDeckList,
      visible: Boolean(body.visible),
    },
    { idd: session.userId, role: session.role },
  );

  if (!result.success) {
    return NextResponse.json({ error: result.message ?? "No se pudo guardar el mazo." }, { status: 400, headers });
  }

  const decks = await loadPlayableSimulatorDecks(session);
  return NextResponse.json(
    { deckId: result.deckId, decks, message: "Mazo guardado correctamente.", success: true },
    { headers },
  );
}
