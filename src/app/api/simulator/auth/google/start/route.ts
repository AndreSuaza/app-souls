import {
  createGoogleOAuthState,
  createGooglePkceChallenge,
  createGooglePkceVerifier,
  createSimulatorGoogleTransaction,
} from "@/lib/simulator-google-oauth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function validSimulatorState(value: string | null) {
  return Boolean(value && /^[A-Za-z0-9_-]{16,200}$/.test(value));
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const simulatorState = requestUrl.searchParams.get("state")?.trim() ?? "";
  if (!validSimulatorState(simulatorState)) {
    return NextResponse.json(
      { error: "Solicitud OAuth inválida." },
      { status: 400 },
    );
  }

  const clientId = process.env.AUTH_GOOGLE_ID?.trim();
  const clientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();
  const configuredAuthUrl = process.env.NEXTAUTH_URL?.trim();
  if (!clientId || !clientSecret || !configuredAuthUrl) {
    return NextResponse.json(
      { error: "Google OAuth no está configurado en app-souls." },
      { status: 500 },
    );
  }

  let authUrl: URL;
  try {
    authUrl = new URL(configuredAuthUrl);
  } catch {
    return NextResponse.json(
      { error: "La URL de autenticación no está configurada." },
      { status: 500 },
    );
  }

  // Google vuelve siempre al origen canónico de app-souls. Esto evita que el
  // callback dependa de si el simulador fue abierto por localhost o por IP.
  if (requestUrl.origin !== authUrl.origin) {
    const canonicalUrl = new URL(
      "/api/simulator/auth/google/start",
      authUrl,
    );
    canonicalUrl.searchParams.set("state", simulatorState);
    return NextResponse.redirect(canonicalUrl);
  }

  const state = createGoogleOAuthState();
  const codeVerifier = createGooglePkceVerifier();
  await createSimulatorGoogleTransaction({
    simulatorState,
    state,
    codeVerifier,
  });

  const redirectUri = new URL(
    "/api/simulator/auth/google/callback",
    authUrl,
  );
  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", clientId);
  googleUrl.searchParams.set("redirect_uri", redirectUri.toString());
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set(
    "code_challenge",
    createGooglePkceChallenge(codeVerifier),
  );
  googleUrl.searchParams.set("code_challenge_method", "S256");
  googleUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(googleUrl);
}
