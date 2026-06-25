import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_SECONDS = 60 * 15;

export interface SimulatorTokenPayload {
  expiresAt: number;
  nickname: string;
  role: string;
  userId: string;
}

const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");

const secret = () => {
  const value = process.env.SIMULATOR_TOKEN_SECRET;
  if (!value || value.length < 32) throw new Error("SIMULATOR_TOKEN_SECRET must be configured with at least 32 characters.");
  return value;
};

const signature = (body: string) => createHmac("sha256", secret()).update(body).digest("base64url");

export const createSimulatorToken = (payload: Omit<SimulatorTokenPayload, "expiresAt">) => {
  const body = encode({ ...payload, expiresAt: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS });
  return `${body}.${signature(body)}`;
};

export const verifySimulatorToken = (token: string): SimulatorTokenPayload | null => {
  const [body, receivedSignature] = token.split(".");
  if (!body || !receivedSignature) return null;

  const expectedSignature = signature(body);
  if (receivedSignature.length !== expectedSignature.length || !timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SimulatorTokenPayload;
    return payload.expiresAt > Math.floor(Date.now() / 1000) && payload.userId && payload.nickname ? payload : null;
  } catch {
    return null;
  }
};
