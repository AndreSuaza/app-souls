import { ButtonSocial } from "@/components";
import { IoLogoGoogle } from "react-icons/io5";

export default async function LogInPage() {

  return (
     <div className="flex items-center h-screen bg-black bg-[url(/tournaments/ejecutor.jpg)] bg-no-repeat bg-contain md:bg-right">
        <div className="ml-4 px-4 md:ml-24 font-bebas flex flex-col">
        <h1 className="font-bold text-7xl md:text-9xl md:w-[600px] text-gray-200 mb-6">inicia sesión para unirte a la batalla.</h1>
        <ButtonSocial provider="google" className="flex bg-red-600 w-[250px] px-4 py-2 text-gray-200 text-xl text-center">
          <IoLogoGoogle className="w-6 h-6 mr-2"/>
          <span>iniciar sesión con Google</span>
        </ButtonSocial>
        </div>
    </div>
  );
}
