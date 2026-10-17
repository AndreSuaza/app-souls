import { MongoDBAdapter } from "@auth/mongodb-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import { nanoid } from "nanoid";
import db from "@/lib/db";
import { getAvatarValue } from "@/utils/avatar-image";

// Auth.js defaults to lowercase collection names, while the existing Prisma
// data uses the model names as collection names. Keep OAuth in the same data
// set so existing users can be linked instead of creating duplicate profiles.
const baseAdapter = MongoDBAdapter(db, {
  collections: {
    Users: "User",
    Accounts: "Account",
    Sessions: "Session",
    VerificationTokens: "VerificationToken",
  },
});

function splitGoogleName(value?: string | null) {
  const parts = value?.trim().split(/\s+/).filter(Boolean) ?? [];
  return {
    name: parts.shift()?.slice(0, 15) || null,
    lastname: parts.join(" ").slice(0, 15) || null,
  };
}

/**
 * Auth.js creates OAuth users before the sign-in callback runs. The local
 * schema needs a nickname, so new Google users receive a temporary profile
 * that is replaced by the completion form before entering the application.
 */
export const authAdapter: Adapter = {
  ...baseAdapter,
  async createUser(data) {
    if (!baseAdapter.createUser) {
      throw new Error("El adaptador de autenticación no puede crear usuarios.");
    }

    const { name, lastname } = splitGoogleName(data.name);
    const provisionalUser = {
      ...data,
      nickname: `g_${nanoid(8)}`,
      profileCompleted: false,
      name,
      lastname,
      image: getAvatarValue(),
      role: "player",
      status: "active",
      emailVerified: data.emailVerified ?? new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AdapterUser;

    return baseAdapter.createUser(provisionalUser);
  },
};
