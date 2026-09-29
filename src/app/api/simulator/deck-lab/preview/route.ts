import { NextResponse } from "next/server";
import { previewDeckLabDeck } from "@/lib/simulator-deck-lab";
import {
  simulatorCorsHeaders,
  simulatorOptionsResponse,
} from "@/lib/simulator-cors";
import { verifySimulatorToken } from "@/lib/simulator-token";

export const runtime = "nodejs";

const getToken = (request: Request) =>
  request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";

export async function OPTIONS(request: Request) {
  return simulatorOptionsResponse(request, "POST, OPTIONS");
}

export async function POST(request: Request) {
  const headers = simulatorCorsHeaders(request.headers.get("origin"));
  const session = verifySimulatorToken(getToken(request));
  if (!session)
    return NextResponse.json(
      { error: "Token de simulador invalido." },
      { status: 401, headers },
    );

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || typeof body.deckList !== "string") {
    return NextResponse.json(
      { error: "Código de mazo invalido." },
      { status: 400, headers },
    );
  }

  const preview = await previewDeckLabDeck(
    body.deckList,
    typeof body.tokenDeckList === "string" ? body.tokenDeckList : "",
  );
  if (!preview) {
    return NextResponse.json(
      { error: "No se pudo leer el código del mazo." },
      { status: 400, headers },
    );
  }

  return NextResponse.json(preview, { headers });
}
