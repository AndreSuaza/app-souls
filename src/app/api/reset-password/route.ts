import { prisma } from "@/lib/prisma";
import { isVerificationTokenForPurpose } from "@/lib/verification-token";
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

  if (
    !isVerificationTokenForPurpose(verifyToken.identifier, "password-reset")
  ) {
    return new Response("Token not found", { status: 400 });
  }

  if (verifyToken.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { token } });
    return new Response("Token expired", { status: 400 });
  }

  // redirige a tu página de reset con este token
  redirect(`/auth/reset-password?token=${token}`);
}
