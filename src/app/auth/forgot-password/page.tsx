import Image from "next/image";
import { ForgotPasswordForm } from "@/components";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar contraseña | Souls In Xtinction TCG",
  description:
    "Solicita el restablecimiento de tu contraseña en Souls In Xtinction TCG. Te enviaremos un enlace seguro para recuperar el acceso y seguir jugando sin perder tu progreso.",
  keywords: [
    "Souls In Xtinction",
    "recuperar contraseña",
    "restablecer",
    "TCG",
    "cuenta",
  ],
  alternates: {
    canonical: "https://soulsinxtinction.com/auth/forgot-password",
  },
  openGraph: {
    title: "Recuperar contraseña | Souls In Xtinction TCG",
    description:
      "Solicita el restablecimiento de tu contraseña en Souls In Xtinction TCG. Te enviaremos un enlace seguro para recuperar el acceso y seguir jugando sin perder tu progreso.",
    url: "https://soulsinxtinction.com/auth/forgot-password",
    siteName: "Souls In Xtinction TCG",
    images: [
      {
        url: "https://soulsinxtinction.com/souls-in-xtinction.webp",
        width: 800,
        height: 600,
        alt: "Souls In Xtinction TCG",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative grid min-h-screen grid-cols-1 bg-gray-900 bg-[url(/bg-registro.webp)] bg-cover bg-fixed lg:grid-cols-2 before:absolute before:inset-0 before:bg-gradient-to-r before:from-gray-900/80 before:via-gray-900/60 before:to-gray-900/30 before:content-['']">
      <h1 className="sr-only">Recuperar contraseña</h1>
      <div className="relative z-10 lg:h-screen text-white">
        <div className="mt-16 mx-auto lg:ml-16">
          <Link
            href="/"
            title="Ir al inicio"
            className="relative block w-[300px] h-[61px] lg:w-[446px] lg:h-[85px] mx-auto lg:mx-0"
          >
            <Image
              fill
              src="/souls-in-xtinction-logo-white.webp"
              alt="Souls In Xtinction"
              title="Ir al inicio"
            />
          </Link>

          <p className="text-2xl mt-4 lg:mt-6 lg:pr-10 lg:text-6xl font-black lg:mb-44 text-center lg:text-left">
            Recuperar contraseña
          </p>
        </div>
      </div>

      <div className="relative z-10 lg:my-auto py-8 lg:px-14">
        <div className="mx-10 rounded-2xl border border-white/35 bg-white/95 px-8 py-8 shadow-[0_28px_70px_rgba(15,23,42,0.35)] backdrop-blur lg:px-14">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
