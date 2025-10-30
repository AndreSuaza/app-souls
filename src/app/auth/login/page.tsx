import Image from "next/image";
import { LoginForm } from "./ui/LoginForm";

interface Props {
  searchParams: Promise<{ verified: string; error: string }>
}

export default async function LogInPage({searchParams}: Props) {
  
  const { verified } = await searchParams;
  const isVerified = verified === "true";

  return (
    <div className="flex items-end bg-gray-800 min-h-screen bg-[url(/bg-registro.webp)] bg-cover bg-fixed">
      <div className="m-auto w-[600px]">

      <div className="mx-auto lg:ml-16 mb-6">
        <div className="relative w-[300px] h-[61px] lg:w-[446px] lg:h-[85px] mx-auto lg:mx-0">
          <Image fill  src='/souls-in-xtinction-logo-white.webp' alt="Carta Prime Wenddygo" title="Prime Wenddygo"/>           
        </div>
      </div>
      
      <div className="">
        <div className="bg-white py-8 px-14 mx-10">
          <p className="text-2xl font-semibold text-center">Iniciar sesión</p>
          <LoginForm
          isVerified={isVerified}
        />
        </div>
      </div>
      </div>
    </div>
  );
}
