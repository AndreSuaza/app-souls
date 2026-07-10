import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { simulatorCorsHeaders, simulatorOptionsResponse } from "@/lib/simulator-cors";
import { createSimulatorToken } from "@/lib/simulator-token";
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

  const user = await prisma.user.findFirst({
    where: { email: { equals: normalizeEmail(parsed.data.email), mode: "insensitive" } },
    select: { id: true, nickname: true, password: true, role: true, status: true },
  });
  if (!user || !user.password || user.status !== "active" || !(await bcrypt.compare(parsed.data.password, user.password))) {
    return NextResponse.json({ error: "Correo o contrasena incorrectos." }, { status: 401, headers });
  }

  const token = createSimulatorToken({ userId: user.id, nickname: user.nickname, role: user.role });
  return NextResponse.json({ token, expiresIn: 900, user: { id: user.id, nickname: user.nickname, role: user.role } }, { headers });
}
