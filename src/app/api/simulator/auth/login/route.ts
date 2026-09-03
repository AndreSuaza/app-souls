import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { simulatorCorsHeaders, simulatorOptionsResponse } from "@/lib/simulator-cors";
import { createSimulatorToken, SIMULATOR_TOKEN_TTL_SECONDS } from "@/lib/simulator-token";
import { getAvatarUrl } from "@/utils/avatar-image";
import { normalizeEmail } from "@/utils/email";

export const runtime = "nodejs";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function OPTIONS(request: Request) {
  return simulatorOptionsResponse(request, "POST, OPTIONS");
}

export async function POST(request: Request) {
  const headers = simulatorCorsHeaders(request.headers.get("origin"));
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Credenciales invalidas." }, { status: 400, headers });

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizeEmail(parsed.data.email), mode: "insensitive" } },
      select: { id: true, image: true, nickname: true, password: true, role: true, status: true },
    });
    if (!user || !user.password || user.status !== "active" || !(await bcrypt.compare(parsed.data.password, user.password))) {
      return NextResponse.json({ error: "Correo o contrasena incorrectos." }, { status: 401, headers });
    }

    const avatarUrl = getAvatarUrl(user.image);
    const token = createSimulatorToken({ userId: user.id, nickname: user.nickname, role: user.role, avatarUrl });
    return NextResponse.json(
      { token, expiresIn: SIMULATOR_TOKEN_TTL_SECONDS, user: { avatarUrl, id: user.id, nickname: user.nickname, role: user.role } },
      { headers },
    );
  } catch (error) {
    console.error("[simulator-auth-login]", error);
    return NextResponse.json(
      { error: "No se pudo conectar con la base de datos. Intenta de nuevo en unos minutos." },
      { status: 503, headers },
    );
  }
}
