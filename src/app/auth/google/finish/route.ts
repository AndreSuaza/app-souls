import { auth } from "@/auth";
import { sanitizeAuthCallbackUrl } from "@/utils/auth-callback";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  // Behind Nginx, request.url can expose the internal localhost origin.
  // Use the configured public Auth.js origin for every post-login redirect.
  const configuredAuthUrl = process.env.NEXTAUTH_URL?.trim();
  const baseUrl = configuredAuthUrl
    ? new URL(configuredAuthUrl)
    : requestUrl;
  const callbackUrl = sanitizeAuthCallbackUrl(
    requestUrl.searchParams.get("callbackUrl"),
  );
  const session = await auth();

  if (!session?.user?.idd) {
    const loginUrl = new URL("/auth/login", baseUrl);
    loginUrl.searchParams.set("error", "GoogleSessionMissing");
    return NextResponse.redirect(loginUrl);
  }

  if (session.user.profileCompleted === false) {
    const completionUrl = new URL("/auth/complete-profile", baseUrl);
    completionUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(completionUrl);
  }

  return NextResponse.redirect(new URL(callbackUrl, baseUrl));
}
