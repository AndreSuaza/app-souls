import NextAuth, { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./lib/prisma";
import { z } from 'zod';
import bcrypt from 'bcryptjs';

interface Data {
  id: string;
  name: string;
  email: string;
  emailVerified?: Date;
  role: string;
  image?: string;
}

export const authConfig: NextAuthConfig = {
  callbacks:{

     authorized({ auth, request: { nextUrl } }) {

      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/perfil');

      if ( isLoggedIn ) return true;
      if ( isOnDashboard ) {
        return Response.redirect(new URL('/auth/login', nextUrl));
      }

      
      // if (isOnDashboard) {
      //   if (isLoggedIn) return true;
      //   return false; // Redirect unauthenticated users to login page
      // } else if (isLoggedIn) {
      //   return Response.redirect(new URL('/', nextUrl));
      // }
      return true;
    },

    jwt({ token, user }) {
      if ( user ) {
        token.data = user;
      }

      return token;
    },

    session({ session, token }) {
      const tes = token.data as Data;
      session.user = {
        id: tes.id,
        name: tes.name,
        email: tes.email,
        emailVerified: tes.emailVerified ? tes.emailVerified : new Date(),
        role: tes.role,
        image: tes.image,
      }
      return session;
    },

  },
  providers: [
    CredentialsProvider({
      credentials: {
          email: {},
          password: {},
      },
      authorize: async (credentials) => {

        const parsedCredentials  = z
          .object({email: z.string().email(), password: z.string().min(6)})
          .safeParse(credentials);

          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email y contraseña requeridos");
          }


        if(!parsedCredentials.data) {
            throw new Error("Email y contraseña requeridos 1");
        }

          const { email, password } = parsedCredentials.data;

    
          const user = await prisma.user.findUnique({ where: {email: email.toLowerCase()}});

          if (!user) {
            throw new Error("Usuario no encontrado");
          }

          const isValidPassword = bcrypt.compare(password, user.password);

          if (!isValidPassword) {
            throw new Error("Contraseña incorrecta");
          }
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            nickname: user.nickname,
            createdDate: user.createdDate,
            updatedDate: user.updatedDate
        };
      }
    
    }),
  ],
}

export const {  signIn, signOut, auth, handlers } = NextAuth( authConfig );