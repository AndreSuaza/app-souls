import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  // validar token
  if (!token) {
    return new Response("Token not found", { status: 400 });
  }

  // buscar token en la base de datos
  const verifyToken = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!verifyToken) {
    return new Response("Token not found", { status: 400 });
  }

  if (verifyToken.expires < new Date()) {
    return new Response("Token expired", { status: 400 });
  }

  // redirige a tu página de reset con este token
  redirect(`/auth/reset-password?token=${token}`);
}
