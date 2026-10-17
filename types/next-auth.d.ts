import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      idd?: string;
      role?: string;
      nickname?: string;
      lastname?: string | null;
      image?: string| null;
      storeId?: string | null;
      profileCompleted?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    idd?: string;
    role?: string;
    nickname?: string;
    lastname?: string | null;
    image?: string| null;
    storeId?: string | null;
    profileCompleted?: boolean;
    status?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    idd?: string;
    role?: string;
    nickname?: string;
    lastname?: string | null;
    image?: string| null;
    storeId?: string | null;
    profileCompleted?: boolean;
    name?: string | null;
    expiresAt?: number;
  }
}
