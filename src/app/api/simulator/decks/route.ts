import { NextResponse } from "next/server";
import { simulatorCorsHeaders, simulatorOptionsResponse } from "@/lib/simulator-cors";
import { loadPlayableSimulatorDecks } from "@/lib/simulator-deck-lab";
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

  const decks = await loadPlayableSimulatorDecks(session);

  return NextResponse.json(
    { decks },
    { headers },
  );
}
