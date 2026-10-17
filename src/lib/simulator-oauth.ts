import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const SIMULATOR_OAUTH_CODE_TTL_MS = 5 * 60 * 1000;

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function createSimulatorOAuthCode(userId: string) {
  const now = new Date();
  await prisma.simulatorOAuthExchange.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  const code = randomBytes(32).toString("base64url");
  await prisma.simulatorOAuthExchange.create({
    data: {
      codeHash: hashCode(code),
      userId,
      expiresAt: new Date(now.getTime() + SIMULATOR_OAUTH_CODE_TTL_MS),
    },
  });

  return code;
}

export async function consumeSimulatorOAuthCode(code: string) {
  const now = new Date();
  const exchange = await prisma.simulatorOAuthExchange.findUnique({
    where: { codeHash: hashCode(code) },
    select: { id: true, userId: true, expiresAt: true, consumedAt: true },
  });

  if (
    !exchange ||
    exchange.consumedAt ||
    exchange.expiresAt.getTime() <= now.getTime()
  ) {
    return null;
  }

  const consumed = await prisma.simulatorOAuthExchange.updateMany({
    where: {
      id: exchange.id,
      expiresAt: { gt: now },
      OR: [{ consumedAt: null }, { consumedAt: { isSet: false } }],
    },
    data: { consumedAt: now },
  });

  return consumed.count === 1 ? exchange.userId : null;
}
