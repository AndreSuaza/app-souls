import { NextResponse } from "next/server";
import { createSimulatorOAuthCode } from "@/lib/simulator-oauth";
import {
  consumeSimulatorGoogleTransaction,
  createSimulatorProfileTicketForTransaction,
  discardSimulatorGoogleTransaction,
  findSimulatorGoogleTransaction,
} from "@/lib/simulator-google-oauth";
import { resolveSimulatorGoogleUser } from "@/lib/simulator-google-identity";

export const runtime = "nodejs";

type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
};

type GoogleTokenInfo = {
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  exp?: string;
  family_name?: string;
  given_name?: string;
  iss?: string;
  name?: string;
  sub?: string;
};

type GoogleUserInfo = {
  email?: string;
  email_verified?: boolean;
  family_name?: string;
  given_name?: string;
  name?: string;
  sub?: string;
};

function simulatorCallbackUrl(state: string) {
  const origin = process.env.SIMULATOR_WEB_ORIGIN?.trim();
  if (!origin) return null;

  const callback = new URL("/auth/google/callback", origin);
  callback.searchParams.set("state", state);
  return callback;
}

function appUrl(path: string) {
  const configuredUrl = process.env.NEXTAUTH_URL?.trim();
  if (!configuredUrl) return null;
  return new URL(path, configuredUrl);
}

async function exchangeGoogleCode(input: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}) {
  const clientId = process.env.AUTH_GOOGLE_ID?.trim();
  const clientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();
  if (!clientId || !clientSecret) throw new Error("GoogleConfigMissing");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: input.code,
      code_verifier: input.codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: input.redirectUri,
    }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  if (!response.ok) throw new Error("GoogleCodeExchangeFailed");
  const payload = (await response.json()) as GoogleTokenResponse;
  if (!payload.access_token || !payload.id_token) {
    throw new Error("GoogleTokenResponseInvalid");
  }

  return payload;
}

async function readGoogleIdentity(input: {
  accessToken: string;
  idToken: string;
}) {
  const clientId = process.env.AUTH_GOOGLE_ID?.trim();
  if (!clientId) throw new Error("GoogleConfigMissing");

  const tokenInfoResponse = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(input.idToken)}`,
    { cache: "no-store" },
  );
  if (!tokenInfoResponse.ok) throw new Error("GoogleIdentityInvalid");
  const tokenInfo = (await tokenInfoResponse.json()) as GoogleTokenInfo;

  const tokenIsExpired = tokenInfo.exp
    ? Number(tokenInfo.exp) * 1000 <= Date.now()
    : true;
  const emailVerified =
    tokenInfo.email_verified === true || tokenInfo.email_verified === "true";
  const validIssuer =
    tokenInfo.iss === "accounts.google.com" ||
    tokenInfo.iss === "https://accounts.google.com";
  if (
    tokenInfo.aud !== clientId ||
    !validIssuer ||
    tokenIsExpired ||
    !tokenInfo.sub ||
    !tokenInfo.email ||
    !emailVerified
  ) {
    throw new Error("GoogleEmailNotVerified");
  }

  const userInfoResponse = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      cache: "no-store",
      headers: { Authorization: `Bearer ${input.accessToken}` },
    },
  );
  if (!userInfoResponse.ok) throw new Error("GoogleUserInfoFailed");
  const userInfo = (await userInfoResponse.json()) as GoogleUserInfo;

  if (
    userInfo.sub !== tokenInfo.sub ||
    userInfo.email?.toLowerCase() !== tokenInfo.email.toLowerCase() ||
    userInfo.email_verified !== true
  ) {
    throw new Error("GoogleIdentityInvalid");
  }

  return {
    email: tokenInfo.email,
    lastname: userInfo.family_name ?? tokenInfo.family_name ?? null,
    name: userInfo.given_name ?? tokenInfo.given_name ?? userInfo.name ?? tokenInfo.name ?? null,
    providerAccountId: tokenInfo.sub,
  };
}

function errorCode(error: unknown) {
  const value = error instanceof Error ? error.message : "";
  if (value === "GoogleEmailNotVerified") return value;
  if (value === "GoogleAccountConflict") return value;
  if (value === "AccountInactive") return value;
  return "GoogleOAuthFailed";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const state = requestUrl.searchParams.get("state")?.trim() ?? "";
  const code = requestUrl.searchParams.get("code")?.trim() ?? "";
  const providerError = requestUrl.searchParams.get("error")?.trim();
  const transaction = state ? await findSimulatorGoogleTransaction(state) : null;

  if (!transaction) {
    const loginUrl = appUrl("/auth/login");
    if (loginUrl) loginUrl.searchParams.set("error", "GoogleStateInvalid");
    return loginUrl
      ? NextResponse.redirect(loginUrl)
      : NextResponse.json({ error: "Google OAuth no está configurado." }, { status: 500 });
  }

  const callback = simulatorCallbackUrl(transaction.simulatorState);
  if (!callback) {
    await discardSimulatorGoogleTransaction(transaction.id);
    return NextResponse.json(
      { error: "El simulador no tiene un origen configurado." },
      { status: 500 },
    );
  }

  if (providerError || !code) {
    await discardSimulatorGoogleTransaction(transaction.id);
    callback.searchParams.set(
      "error",
      providerError === "access_denied" ? "GoogleCancelled" : "GoogleOAuthFailed",
    );
    return NextResponse.redirect(callback);
  }

  try {
    const authUrl = appUrl("/");
    if (!authUrl) throw new Error("GoogleConfigMissing");
    const redirectUri = new URL(
      "/api/simulator/auth/google/callback",
      authUrl,
    );
    const tokens = await exchangeGoogleCode({
      code,
      codeVerifier: transaction.codeVerifier,
      redirectUri: redirectUri.toString(),
    });
    const identity = await readGoogleIdentity({
      accessToken: tokens.access_token as string,
      idToken: tokens.id_token as string,
    });
    const resolved = await resolveSimulatorGoogleUser(identity);

    if (resolved.error) throw new Error(resolved.error);
    if (!resolved.user) throw new Error("GoogleUserMissing");

    const consumed = await consumeSimulatorGoogleTransaction(
      transaction.id,
      resolved.user.id,
    );
    if (!consumed) {
      callback.searchParams.set("error", "GoogleStateInvalid");
      return NextResponse.redirect(callback);
    }

    if (!resolved.user.profileCompleted) {
      const ticket = await createSimulatorProfileTicketForTransaction({
        transactionId: transaction.id,
        userId: resolved.user.id,
      });
      if (!ticket) throw new Error("GoogleProfileTicketFailed");

      const completionUrl = appUrl("/auth/complete-profile");
      if (!completionUrl) throw new Error("GoogleConfigMissing");
      completionUrl.searchParams.set("simulatorTicket", ticket);
      return NextResponse.redirect(completionUrl);
    }

    const exchangeCode = await createSimulatorOAuthCode(resolved.user.id);
    callback.searchParams.set("code", exchangeCode);
    return NextResponse.redirect(callback);
  } catch (error) {
    await discardSimulatorGoogleTransaction(transaction.id);
    callback.searchParams.set("error", errorCode(error));
    return NextResponse.redirect(callback);
  }
}
