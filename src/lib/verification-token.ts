import { normalizeEmail } from "@/utils/email";

export const EMAIL_VERIFICATION_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;
export const PASSWORD_RESET_TOKEN_TTL_MS = 1000 * 60 * 30;
export const VERIFICATION_TOKEN_RESEND_COOLDOWN_MS = 1000 * 60;

export type VerificationTokenPurpose = "email-verification" | "password-reset";

const PURPOSE_PREFIX: Record<VerificationTokenPurpose, string> = {
  "email-verification": "email-verification:",
  "password-reset": "password-reset:",
};

export const getVerificationTokenIdentifier = (
  email: string,
  purpose: VerificationTokenPurpose,
) => `${PURPOSE_PREFIX[purpose]}${normalizeEmail(email)}`;

export const getLegacyVerificationTokenIdentifier = (email: string) =>
  normalizeEmail(email);

export const getVerificationTokenIdentifiers = (
  email: string,
  purpose: VerificationTokenPurpose,
) => [
  getVerificationTokenIdentifier(email, purpose),
  getLegacyVerificationTokenIdentifier(email),
];

export const getVerificationTokenPurpose = (
  identifier: string,
): VerificationTokenPurpose | null => {
  if (identifier.startsWith(PURPOSE_PREFIX["email-verification"])) {
    return "email-verification";
  }

  if (identifier.startsWith(PURPOSE_PREFIX["password-reset"])) {
    return "password-reset";
  }

  return null;
};

export const resolveVerificationTokenEmail = (identifier: string) => {
  const purpose = getVerificationTokenPurpose(identifier);

  if (!purpose) return normalizeEmail(identifier);

  return normalizeEmail(identifier.slice(PURPOSE_PREFIX[purpose].length));
};

export const isVerificationTokenForPurpose = (
  identifier: string,
  purpose: VerificationTokenPurpose,
) => {
  const tokenPurpose = getVerificationTokenPurpose(identifier);
  return tokenPurpose === null || tokenPurpose === purpose;
};

export const getVerificationTokenRetryAfterSeconds = (
  expires: Date,
  ttlMs: number,
  now = new Date(),
) => {
  const issuedAtMs = expires.getTime() - ttlMs;
  const retryAtMs = issuedAtMs + VERIFICATION_TOKEN_RESEND_COOLDOWN_MS;
  const remainingMs = retryAtMs - now.getTime();

  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
};
