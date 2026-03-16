import Image from "next/image";
import Link from "next/link";
import { RegisterForm } from "@/components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro de jugador | Souls In Xtinction TCG",
  description:
    "Crea tu cuenta en Souls In Xtinction TCG para coleccionar cartas, construir mazos y participar en torneos. Completa tu registro y accede a herramientas y contenido exclusivo.",
  keywords: [
    "Souls In Xtinction",
    "registro",
    "crear cuenta",
    "TCG",
    "cartas",
    "mazos",
  ],
  alternates: {
    canonical: "https://soulsinxtinction.com/auth/register",
  },
  openGraph: {
    title: "Registro de jugador | Souls In Xtinction TCG",
    description:
      "Crea tu cuenta en Souls In Xtinction TCG para coleccionar cartas, construir mazos y participar en torneos. Completa tu registro y accede a herramientas y contenido exclusivo.",
    url: "https://soulsinxtinction.com/auth/register",
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

export default async function LogInPage() {
  return (
    <div className="relative grid min-h-screen grid-cols-1 bg-gray-900 bg-[url(/bg-registro.webp)] bg-cover bg-fixed lg:grid-cols-2 before:absolute before:inset-0 before:bg-gradient-to-r before:from-gray-900/80 before:via-gray-900/60 before:to-gray-900/30 before:content-['']">
      <h1 className="sr-only">Registro de jugador</h1>
      <div className="relative lg:h-screen text-white">
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

          <div className="mt-10 text-center lg:text-left lg:pr-20">
            <p className="text-xs ml-2 tracking-[0.2em] text-slate-200/90">
              Registro de jugador
            </p>
            <p className="mt-3 text-3xl font-black tracking-tight text-white drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)] lg:text-6xl">
              Crear una cuenta
            </p>
          </div>
        </div>
      </div>

      <div className="relative my-auto py-10 lg:px-14">
        <div className="mx-6 rounded-2xl border border-white/35 bg-white/95 px-8 py-8 shadow-[0_28px_70px_rgba(15,23,42,0.35)] backdrop-blur lg:mx-0 lg:w-full">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
