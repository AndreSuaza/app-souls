import NextAuth from "next-auth"
import authConfig from "@/auth.config";
import Google from "next-auth/providers/google"
import Discord from "next-auth/providers/discord"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import  db from "@/lib/db";


export const {  signIn, signOut, auth, handlers } = NextAuth({
  adapter: MongoDBAdapter(db),
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    // jwt() se ejecuta cada vez que se crea o actualiza un token JWT.
    // Aquí es donde puedes agregar información adicional al token.
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    // session() se utiliza para agregar la información del token a la sesión del usuario,
    // lo que hace que esté disponible en el cliente.
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  events: {
    // El evento linkAccount se dispara cuando una cuenta (proveedor OAuth: GitHub, Google, Facebook, etc.)  se vincula a un usuario existente en tu base de datos.
    // async linkAccount({ user }) {
    //   await db.user.update({
    //     where: { id: user.id },
    //     data: {
    //       emailVerified: new Date(),
    //     },
    //   });
    // },
  },
  providers: [
    Google,
    Discord,
  ],
  
});