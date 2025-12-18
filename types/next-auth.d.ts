import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      idd?: string;
      role?: string;
      nickname?: string;
      image?: string;
      storeId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    idd?: string;
    role?: string;
    nickname?: string;
    image?: string;
    storeId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    idd?: string;
    role?: string;
    nickname?: string;
    image?: string;
    storeId?: string | null;
  }
}
