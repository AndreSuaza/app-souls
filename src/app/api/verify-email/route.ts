import { prisma } from "@/lib/prisma";
import {
  isVerificationTokenForPurpose,
  resolveVerificationTokenEmail,
} from "@/lib/verification-token";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return new Response("Token not found", { status: 400 });
  }

  // verificar si existe un token en la base de datos
  const verifyToken = await prisma.verificationToken.findFirst({
    where: {
      token,
    },
  });

  if (!verifyToken) {
    return new Response("Token not found", { status: 400 });
  }

  if (
    !isVerificationTokenForPurpose(
      verifyToken.identifier,
      "email-verification",
    )
  ) {
    return new Response("Token not found", { status: 400 });
  }

  // verificar si el token ya expiró
  if (verifyToken.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { token } });
    return new Response("Token expired", { status: 400 });
  }

  const email = resolveVerificationTokenEmail(verifyToken.identifier);

  // verificar si el email ya esta verificado
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    select: { id: true, emailVerified: true },
  });

  if (!user) {
    await prisma.verificationToken.deleteMany({ where: { token } });
    return new Response("Token not found", { status: 400 });
  }

  if (user?.emailVerified) {
    await prisma.verificationToken.deleteMany({ where: { token } });
    return new Response("Email already verified", { status: 400 });
  }

  // marcar el email como verificado
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerified: new Date(),
    },
  });

  // eliminar el token
  await prisma.verificationToken.deleteMany({ where: { token } });

  // return Response.json({ token });
  redirect("/auth/login?verified=true");
}
