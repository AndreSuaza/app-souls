import { NextResponse } from "next/server";
import { countMainDeckCards, deleteUserDeck, saveUserDeck } from "@/lib/deck-management";
import { loadDeckLabDetail, loadPlayableSimulatorDecks } from "@/lib/simulator-deck-lab";
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
  return simulatorOptionsResponse(request, "GET, PATCH, DELETE, OPTIONS");
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = simulatorCorsHeaders(request.headers.get("origin"));
  const session = verifySimulatorToken(getToken(request));
  if (!session) return NextResponse.json({ error: "Token de simulador invalido." }, { status: 401, headers });

  const { id } = await params;
  const deck = await loadDeckLabDetail(session, id);
  if (!deck) return NextResponse.json({ error: "Mazo no encontrado." }, { status: 404, headers });

  return NextResponse.json({ deck }, { headers });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = simulatorCorsHeaders(request.headers.get("origin"));
  const session = verifySimulatorToken(getToken(request));
  if (!session) return NextResponse.json({ error: "Token de simulador invalido." }, { status: 401, headers });

  const { id } = await params;
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
      deckId: id,
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
    { deckId: id, decks, message: "Mazo guardado correctamente.", success: true },
    { headers },
  );
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = simulatorCorsHeaders(request.headers.get("origin"));
  const session = verifySimulatorToken(getToken(request));
  if (!session) return NextResponse.json({ error: "Token de simulador invalido." }, { status: 401, headers });

  const { id } = await params;

  try {
    await deleteUserDeck({ deckId: id }, { idd: session.userId, role: session.role });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo eliminar el mazo." },
      { status: 400, headers },
    );
  }

  const decks = await loadPlayableSimulatorDecks(session);
  return NextResponse.json(
    { decks, message: "Mazo eliminado correctamente.", success: true },
    { headers },
  );
}
