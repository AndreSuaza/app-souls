import { auth } from "@/auth";
import { sanitizeAuthCallbackUrl } from "@/utils/auth-callback";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const callbackUrl = sanitizeAuthCallbackUrl(
    url.searchParams.get("callbackUrl"),
  );
  const session = await auth();

  if (!session?.user?.idd) {
    const loginUrl = new URL("/auth/login", url);
    loginUrl.searchParams.set("error", "GoogleSessionMissing");
    return NextResponse.redirect(loginUrl);
  }

  if (session.user.profileCompleted === false) {
    const completionUrl = new URL("/auth/complete-profile", url);
    completionUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(completionUrl);
  }

  return NextResponse.redirect(new URL(callbackUrl, url));
}
