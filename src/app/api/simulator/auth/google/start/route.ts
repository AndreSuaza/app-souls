import { handlers } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function requestOrigin(request: Request, fallbackUrl: URL) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
  const host = forwardedHost || request.headers.get("host")?.trim();
  if (!host) return fallbackUrl.origin;

  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",", 1)[0]
    ?.trim();
  const protocol = forwardedProtocol || fallbackUrl.protocol.replace(":", "");
  return `${protocol}://${host}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state")?.trim();
  if (!state || state.length > 200) {
    return NextResponse.json({ error: "Solicitud OAuth inválida." }, { status: 400 });
  }

  // Auth.js derives cookie scope from the request host, while its callback
  // uses NEXTAUTH_URL. Canonicalize the start request first so both values
  // always belong to the same origin, even if the simulator was opened by
  // LAN IP or with an older Vite environment loaded.
  const configuredAuthUrl = process.env.NEXTAUTH_URL?.trim() || "http://localhost:3000";
  if (configuredAuthUrl) {
    const authUrl = new URL(configuredAuthUrl);
    if (authUrl.origin !== requestOrigin(request, url)) {
      const canonicalStartUrl = new URL("/api/simulator/auth/google/start", authUrl);
      canonicalStartUrl.searchParams.set("state", state);
      return NextResponse.redirect(canonicalStartUrl);
    }
  }

  const finishUrl = new URL("/api/simulator/auth/google/finish", url);
  finishUrl.searchParams.set("state", state);

  // Generate the CSRF cookie through Auth.js, then let the browser perform
  // the provider POST itself. This keeps PKCE cookies in the same browser
  // response and avoids losing them through an internal server redirect.
  const csrfResponse = await handlers.GET(
    new NextRequest(new URL("/api/auth/csrf", url), {
      headers: request.headers,
    }),
  );
  const csrfPayload = (await csrfResponse.json()) as { csrfToken?: string };
  if (!csrfPayload.csrfToken) {
    return NextResponse.json(
      { error: "No se pudo iniciar la autenticación con Google." },
      { status: 500 },
    );
  }

  const response = new NextResponse(
    `<!doctype html>
<html lang="es">
  <head><meta charset="utf-8"><title>Continuar con Google</title></head>
  <body>
    <form id="google-oauth-form" action="/api/auth/signin/google" method="post">
      <input type="hidden" name="csrfToken" value="${escapeHtml(csrfPayload.csrfToken)}">
      <input type="hidden" name="callbackUrl" value="${escapeHtml(`${finishUrl.pathname}${finishUrl.search}`)}">
    </form>
    <script>document.getElementById("google-oauth-form").submit();</script>
    <noscript><button form="google-oauth-form" type="submit">Continuar con Google</button></noscript>
  </body>
</html>`,
    {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/html; charset=utf-8",
      },
    },
  );

  const setCookie = csrfResponse.headers.get("set-cookie");
  if (setCookie) response.headers.append("set-cookie", setCookie);

  return response;
}
