import { NextResponse } from "next/server";
import { simulatorCorsHeaders, simulatorOptionsResponse } from "@/lib/simulator-cors";
import { verifySimulatorToken } from "@/lib/simulator-token";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return simulatorOptionsResponse(request, "GET, OPTIONS");
}

export async function GET(request: Request) {
  const headers = simulatorCorsHeaders(request.headers.get("origin"));
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const session = verifySimulatorToken(token);

  if (!session) return NextResponse.json({ error: "Token de simulador invalido." }, { status: 401, headers });

  return NextResponse.json(
    { user: { id: session.userId, nickname: session.nickname, role: session.role }, expiresAt: session.expiresAt },
    { headers },
  );
}
