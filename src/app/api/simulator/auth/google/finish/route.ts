import { auth } from "@/auth";
import { createSimulatorOAuthCode } from "@/lib/simulator-oauth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function simulatorCallbackUrl(state: string) {
  const origin = process.env.SIMULATOR_WEB_ORIGIN;
  if (!origin) return null;

  const callback = new URL("/auth/google/callback", origin);
  callback.searchParams.set("state", state);
  return callback;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const state = requestUrl.searchParams.get("state")?.trim();
  if (!state || state.length > 200) {
    return NextResponse.json({ error: "Solicitud OAuth inválida." }, { status: 400 });
  }

  const callback = simulatorCallbackUrl(state);
  if (!callback) {
    return NextResponse.json(
      { error: "El simulador no tiene un origen configurado." },
      { status: 500 },
    );
  }

  const session = await auth();
  if (!session?.user?.idd) {
    callback.searchParams.set("error", "GoogleSessionMissing");
    return NextResponse.redirect(callback);
  }

  if (session.user.profileCompleted === false) {
    const completionUrl = new URL("/auth/complete-profile", requestUrl);
    completionUrl.searchParams.set(
      "callbackUrl",
      `/api/simulator/auth/google/finish?state=${encodeURIComponent(state)}`,
    );
    return NextResponse.redirect(completionUrl);
  }

  const code = await createSimulatorOAuthCode(session.user.idd);
  callback.searchParams.set("code", code);
  return NextResponse.redirect(callback);
}
