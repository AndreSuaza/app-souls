import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const SIMULATOR_GOOGLE_TRANSACTION_TTL_MS = 10 * 60 * 1000;

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function createOpaqueValue(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function hashSimulatorGoogleState(state: string) {
  return hashValue(state);
}

export function createGooglePkceVerifier() {
  return createOpaqueValue(32);
}

export function createGooglePkceChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function createGoogleOAuthState() {
  return createOpaqueValue(32);
}

export function createSimulatorProfileTicket() {
  return createOpaqueValue(32);
}

export async function createSimulatorGoogleTransaction(input: {
  simulatorState: string;
  state: string;
  codeVerifier: string;
}) {
  const now = new Date();
  await prisma.simulatorGoogleOAuthTransaction.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  return prisma.simulatorGoogleOAuthTransaction.create({
    data: {
      stateHash: hashValue(input.state),
      simulatorState: input.simulatorState,
      codeVerifier: input.codeVerifier,
      expiresAt: new Date(now.getTime() + SIMULATOR_GOOGLE_TRANSACTION_TTL_MS),
    },
  });
}

export async function findSimulatorGoogleTransaction(state: string) {
  const transaction = await prisma.simulatorGoogleOAuthTransaction.findUnique({
    where: { stateHash: hashValue(state) },
  });

  if (
    !transaction ||
    transaction.consumedAt ||
    transaction.expiresAt.getTime() <= Date.now()
  ) {
    return null;
  }

  return transaction;
}

export async function consumeSimulatorGoogleTransaction(
  transactionId: string,
  userId: string,
) {
  const now = new Date();
  const consumed = await prisma.simulatorGoogleOAuthTransaction.updateMany({
    where: {
      id: transactionId,
      expiresAt: { gt: now },
      OR: [{ consumedAt: null }, { consumedAt: { isSet: false } }],
    },
    data: { consumedAt: now, userId },
  });

  return consumed.count === 1;
}

export async function discardSimulatorGoogleTransaction(transactionId: string) {
  await prisma.simulatorGoogleOAuthTransaction.updateMany({
    where: {
      id: transactionId,
      OR: [{ consumedAt: null }, { consumedAt: { isSet: false } }],
    },
    data: { consumedAt: new Date() },
  });
}

export async function createSimulatorProfileTicketForTransaction(input: {
  transactionId: string;
  userId: string;
}) {
  const ticket = createSimulatorProfileTicket();
  const updated = await prisma.simulatorGoogleOAuthTransaction.updateMany({
    where: {
      id: input.transactionId,
      userId: input.userId,
      expiresAt: { gt: new Date() },
      consumedAt: { not: null },
    },
    data: { profileTicketHash: hashValue(ticket) },
  });

  return updated.count === 1 ? ticket : null;
}

export async function findSimulatorProfileTicket(ticket: string) {
  const transaction = await prisma.simulatorGoogleOAuthTransaction.findFirst({
    where: {
      profileTicketHash: hashValue(ticket),
      expiresAt: { gt: new Date() },
      userId: { isSet: true },
    },
    select: {
      id: true,
      simulatorState: true,
      userId: true,
      user: {
        select: {
          lastname: true,
          name: true,
          profileCompleted: true,
          status: true,
        },
      },
    },
  });

  return transaction?.userId && transaction.user ? transaction : null;
}

export async function consumeSimulatorProfileTicket(
  transactionId: string,
  ticket: string,
) {
  const consumed = await prisma.simulatorGoogleOAuthTransaction.updateMany({
    where: {
      id: transactionId,
      profileTicketHash: hashValue(ticket),
      expiresAt: { gt: new Date() },
    },
    data: { profileTicketHash: null },
  });

  return consumed.count === 1;
}
