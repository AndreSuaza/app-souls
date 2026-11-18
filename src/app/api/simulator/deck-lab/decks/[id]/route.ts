import { NextResponse } from "next/server";
import { deleteUserDeck, saveUserDeck } from "@/lib/deck-management";
import { loadDeckLabDetail, loadPlayableSimulatorDecks } from "@/lib/simulator-deck-lab";
import { parseSimulatorDeckMutation } from "@/lib/simulator-deck-api";
import { simulatorCorsHeaders, simulatorOptionsResponse } from "@/lib/simulator-cors";
import { verifySimulatorToken } from "@/lib/simulator-token";

export const runtime = "nodejs";

const getToken = (request: Request) => request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";

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
  const parsed = parseSimulatorDeckMutation(body, id);
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
