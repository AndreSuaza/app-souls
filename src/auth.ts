import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import db from "@/lib/db";

export const { signIn, signOut, auth, handlers } = NextAuth({
  adapter: MongoDBAdapter(db),
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    // jwt() se ejecuta cada vez que se crea o actualiza un token JWT.
    // Aquí es donde puedes agregar información adicional al token.
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.idd = user.id;
        token.role = user.role;
        token.nickname = user.nickname;
        token.image = user.image ? user.image : "player";

        // guardar storeId solo si existe
        if (user.role === "store") {
          token.storeId = user.storeId ?? null;
        }
      }
      // Actualiza el avatar en la session cuando el cliente lo cambia.
      if (trigger === "update" && session?.user?.image) {
        token.image = session.user.image;
      }

      return token;
    },
    // session() se utiliza para agregar la información del token a la sesión del usuario,
    // lo que hace que esté disponible en el cliente.
    session({ session, token }) {
      if (session.user) {
        session.user.idd = token.idd;
        session.user.role = token.role;
        session.user.nickname = token.nickname;
        session.user.image = token.image;

        // exponer storeId en sesión
        if (token.role === "store") {
          session.user.storeId = token.storeId ?? null;
        }
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
  // providers: [
  //   Google,
  //   Discord,
  // ],
});
