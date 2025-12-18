import NextAuth, { type NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

const adminRoutes = ["/admin", "/administrador"];
// rutas a las que el usuario con role store puede acceder
const storeAllowedAdminRoutes = ["/admin/torneos", "/administrador/torneos"];
const protectedRoutes = ["/perfil"];
const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];
const apiAuthPrefix = "/api/auth";

// Config especial para middleware: NADA de MongoDB, Prisma, bcrypt, etc.
// Esto debido a que EDGE no soporta esas librerías (solo Node.js).
// Por eso solo validamos el JWT y no hacemos nada más avanzado.
const middlewareAuthConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [], // no hacen falta para validar el JWT
};

const { auth: baseAuth } = NextAuth(middlewareAuthConfig);

export default baseAuth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const isLoggedIn = !!req.auth;

  console.log({ isLoggedIn, path: path });

  // Permitir todas las rutas de API de autenticación
  if (path.startsWith(apiAuthPrefix)) {
    return NextResponse.next();
  }

  // Redirigir a /dashboard si el usuario está logueado y trata de acceder a rutas de autenticación
  if (isLoggedIn && authRoutes.includes(path)) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Redirigir a /login si el usuario no está logueado y trata de acceder a una ruta protegida
  if (adminRoutes.some((route) => path.startsWith(route))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }

    const role = req.auth?.user.role;

    // Restricción específica para usuarios con role store
    if (role === "store") {
      const isAllowed = storeAllowedAdminRoutes.some((allowedRoute) =>
        path.startsWith(allowedRoute)
      );

      // Si intenta acceder a cualquier otra ruta admin → bloquear
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/", nextUrl));
      }
    }
  }

  // Proteger rutas generales (como /perfil)
  if (protectedRoutes.includes(path)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
