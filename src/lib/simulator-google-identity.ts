import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getAvatarValue } from "@/utils/avatar-image";
import { normalizeEmail } from "@/utils/email";

export type SimulatorGoogleIdentity = {
  email: string;
  name: string | null;
  lastname: string | null;
  providerAccountId: string;
};

export type SimulatorGoogleUser = {
  id: string;
  name: string | null;
  lastname: string | null;
  nickname: string;
  profileCompleted: boolean;
  status: string;
};

function splitGoogleName(value?: string | null) {
  const parts = value?.trim().split(/\s+/).filter(Boolean) ?? [];
  return {
    name: parts.shift()?.slice(0, 15) || null,
    lastname: parts.join(" ").slice(0, 15) || null,
  };
}

function selectUser() {
  return {
    id: true,
    name: true,
    lastname: true,
    nickname: true,
    profileCompleted: true,
    status: true,
  } as const;
}

async function createProvisionalUser(identity: SimulatorGoogleIdentity) {
  const { name, lastname } = splitGoogleName(
    [identity.name, identity.lastname].filter(Boolean).join(" "),
  );

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.user.create({
        data: {
          email: identity.email,
          emailVerified: new Date(),
          image: getAvatarValue(),
          lastname,
          name,
          nickname: `g_${nanoid(8)}`,
          password: null,
          profileCompleted: false,
          role: "player",
          status: "active",
        },
        select: selectUser(),
      });
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2002"
      ) {
        throw error;
      }
    }
  }

  throw new Error("No se pudo crear el perfil provisional de Google.");
}

export async function resolveSimulatorGoogleUser(
  identity: SimulatorGoogleIdentity,
) {
  const linkedAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: identity.providerAccountId,
      },
    },
    select: { userId: true },
  });

  let user = linkedAccount
    ? await prisma.user.findUnique({
        where: { id: linkedAccount.userId },
        select: selectUser(),
      })
    : await prisma.user.findFirst({
        where: {
          email: { equals: normalizeEmail(identity.email), mode: "insensitive" },
        },
        select: selectUser(),
      });

  if (!user) {
    user = await createProvisionalUser(identity);
  }

  if (user.status !== "active") {
    return { user, error: "AccountInactive" as const };
  }

  if (!linkedAccount) {
    try {
      await prisma.account.create({
        data: {
          provider: "google",
          providerAccountId: identity.providerAccountId,
          type: "oauth",
          userId: user.id,
        },
      });
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2002"
      ) {
        throw error;
      }

      const conflictingAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "google",
            providerAccountId: identity.providerAccountId,
          },
        },
        select: { userId: true },
      });

      if (!conflictingAccount || conflictingAccount.userId !== user.id) {
        return { user, error: "GoogleAccountConflict" as const };
      }
    }
  }

  if (!linkedAccount) {
    await prisma.user.updateMany({
      where: { id: user.id, emailVerified: null },
      data: { emailVerified: new Date() },
    });
  }

  return { user, error: null };
}
