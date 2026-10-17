const AUTH_CALLBACK_BLOCKLIST = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/complete-profile",
]);

export function sanitizeAuthCallbackUrl(value?: string | null) {
  const fallback = "/";
  if (!value) return fallback;

  try {
    const baseUrl = new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000");
    const parsed = new URL(value, baseUrl);
    if (parsed.origin !== baseUrl.origin) return fallback;
    if (AUTH_CALLBACK_BLOCKLIST.has(parsed.pathname)) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
