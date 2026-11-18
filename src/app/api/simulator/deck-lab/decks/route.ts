import { NextResponse } from "next/server";
import { saveUserDeck } from "@/lib/deck-management";
import { loadOwnedDeckLabSummaries, loadPlayableSimulatorDecks } from "@/lib/simulator-deck-lab";
import { parseSimulatorDeckMutation } from "@/lib/simulator-deck-api";
import { simulatorCorsHeaders, simulatorOptionsResponse } from "@/lib/simulator-cors";
import { verifySimulatorToken } from "@/lib/simulator-token";

export const runtime = "nodejs";

const getToken = (request: Request) => request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";

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
  const parsed = parseSimulatorDeckMutation(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.message }, { status: 400, headers });
  }

  const result = await saveUserDeck(parsed.data, {
    idd: session.userId,
    role: session.role,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.message ?? "No se pudo guardar el mazo." }, { status: 400, headers });
  }

  const decks = await loadPlayableSimulatorDecks(session);
  return NextResponse.json(
    { deckId: result.deckId, decks, message: "Mazo guardado correctamente.", success: true },
    { headers },
  );
}
