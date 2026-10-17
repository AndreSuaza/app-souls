import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  simulatorCorsHeaders,
  simulatorOptionsResponse,
} from "@/lib/simulator-cors";
import { consumeSimulatorOAuthCode } from "@/lib/simulator-oauth";
import {
  createSimulatorToken,
  SIMULATOR_TOKEN_TTL_SECONDS,
} from "@/lib/simulator-token";
import { getAvatarUrl } from "@/utils/avatar-image";

export const runtime = "nodejs";

const exchangeSchema = z.object({ code: z.string().min(20).max(200) });

export async function OPTIONS(request: Request) {
  return simulatorOptionsResponse(request, "POST, OPTIONS");
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const configuredOrigin = process.env.SIMULATOR_WEB_ORIGIN;
  const headers = simulatorCorsHeaders(origin);

  if (!configuredOrigin || origin !== configuredOrigin) {
    return NextResponse.json({ error: "Origen no autorizado." }, { status: 403 });
  }

  const parsed = exchangeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Código OAuth inválido." }, { status: 400, headers });
  }

  const userId = await consumeSimulatorOAuthCode(parsed.data.code);
  if (!userId) {
    return NextResponse.json(
      { error: "El código OAuth expiró o ya fue utilizado." },
      { status: 401, headers },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      image: true,
      nickname: true,
      profileCompleted: true,
      role: true,
      status: true,
    },
  });

  if (!user || user.status !== "active" || user.profileCompleted === false) {
    return NextResponse.json(
      { error: "La cuenta no está lista para usar el simulador." },
      { status: 403, headers },
    );
  }

  const avatarUrl = getAvatarUrl(user.image);
  const token = createSimulatorToken({
    userId: user.id,
    nickname: user.nickname,
    role: user.role,
    avatarUrl,
  });

  return NextResponse.json(
    {
      token,
      expiresIn: SIMULATOR_TOKEN_TTL_SECONDS,
      user: {
        avatarUrl,
        id: user.id,
        nickname: user.nickname,
        role: user.role,
      },
    },
    { headers },
  );
}
