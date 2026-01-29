import Image from "next/image";
import { LoginForm } from "@/components";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ verified: string; error: string; callbackUrl?: string }>;
}

export default async function LogInPage({ searchParams }: Props) {
  const { verified, callbackUrl } = await searchParams;
  const isVerified = verified === "true";

  return (
    <div className="flex items-start bg-gray-800 min-h-[100dvh] bg-[url(/bg-registro.webp)] bg-cover bg-scroll sm:items-end sm:min-h-screen sm:bg-fixed">
      <div className="relative z-10 mx-auto mt-6 w-full max-w-[600px] px-4 pb-6 sm:m-auto sm:mt-0 sm:w-[600px] sm:px-0 sm:pb-0">
        <div className="mx-auto lg:ml-16 mb-6">
          <div className="relative w-[300px] h-[61px] lg:w-[446px] lg:h-[85px] mx-auto lg:mx-0">
            <Link href="/">
              <Image
                fill
                src="/souls-in-xtinction-logo-white.webp"
                alt="Souls In Xtinction"
                className="cursor-pointer"
                title="Ir al inicio"
              />
            </Link>
          </div>
        </div>

        <div className="mx-10 mt-4 sm:mt-0 rounded-2xl border border-white/35 bg-white/95 px-8 py-8 shadow-[0_28px_70px_rgba(15,23,42,0.35)] backdrop-blur space-y-4">
          <p className="text-2xl font-semibold text-center">Iniciar sesión</p>
          <LoginForm isVerified={isVerified} callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}
