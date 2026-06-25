import { NextResponse } from "next/server";
import { verifySimulatorToken } from "@/lib/simulator-token";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const session = verifySimulatorToken(token);

  if (!session) return NextResponse.json({ error: "Token de simulador inválido." }, { status: 401 });

  return NextResponse.json({ user: { id: session.userId, nickname: session.nickname, role: session.role }, expiresAt: session.expiresAt });
}
