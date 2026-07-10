import { NextResponse } from "next/server";
import { userRegistration } from "@/actions/auth/register";
import { simulatorCorsHeaders, simulatorOptionsResponse } from "@/lib/simulator-cors";
import { RegisterSchema } from "@/schemas";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return simulatorOptionsResponse(request, "POST, OPTIONS");
}

export async function POST(request: Request) {
  const headers = simulatorCorsHeaders(request.headers.get("origin"));
  const parsed = RegisterSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Datos invalidos." },
      { status: 400, headers },
    );
  }

  const result = await userRegistration({ ...parsed.data, image: parsed.data.image ?? "" });

  if (!("success" in result) || !result.success) {
    const message = "message" in result && result.message ? result.message : "No se pudo crear la cuenta.";
    const status = /registrado|uso/i.test(message) ? 409 : 400;
    return NextResponse.json({ error: message }, { status, headers });
  }

  return NextResponse.json(
    { success: true, message: "Cuenta creada. Ya puedes iniciar sesion en el simulador." },
    { status: 201, headers },
  );
}
