import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      idd?: string;
      role?: string;
      nickname?: string;
      image?: string;
    } & DefaultSession["user"];
  }

  interface User {
    idd?: string;
    role?: string;
    nickname?: string;
    image?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    idd?: string;
    role?: string;
    nickname?: string;
    image?: string;
  }
}