import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig);

// export default auth((req) => {
//   const { nextUrl } = req;
//   const isLoggedIn = !!req.auth;

//   console.log({ isLoggedIn, path: nextUrl.pathname });

//   // Permitir todas las rutas de API de autenticación
//   if (nextUrl.pathname.startsWith(apiAuthPrefix)) {
//     return NextResponse.next();
//   }

//   // Permitir acceso a rutas públicas sin importar el estado de autenticación
//   if (!nextUrl.pathname.startsWith(adminRoutes)) {
//     return NextResponse.next();
//   }

//   // Redirigir a /dashboard si el usuario está logueado y trata de acceder a rutas de autenticación
//   if (isLoggedIn && authRoutes.includes(nextUrl.pathname)) {
//     return NextResponse.redirect(new URL("/admin/creador-de-torneos", nextUrl));
//   }

//   // Redirigir a /login si el usuario no está logueado y trata de acceder a una ruta protegida
//   if (
//     !isLoggedIn &&
//     !authRoutes.includes(nextUrl.pathname) &&
//     nextUrl.pathname.startsWith(adminRoutes)
//   ) {
//     return NextResponse.redirect(new URL("/auth/login", nextUrl));
//   }

//   return NextResponse.next();
// });
 
export const config = {
   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};