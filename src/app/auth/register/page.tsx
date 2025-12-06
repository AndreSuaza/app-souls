import Image from "next/image";
import { RegisterForm } from "../login/ui/RegisterForm";

export default async function LogInPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 bg-gray-800 min-h-screen bg-[url(/bg-registro.webp)] bg-cover bg-fixed">
      <div className="lg:h-screen text-white">
        <div className="mt-16 mx-auto lg:ml-16">
          <div className="relative w-[300px] h-[61px] lg:w-[446px] lg:h-[85px] mx-auto lg:mx-0">
            <Image
              fill
              src="/souls-in-xtinction-logo-white.webp"
              alt="Carta Prime Wenddygo"
              title="Prime Wenddygo"
            />
          </div>
          <p className="uppercase text-2xl mt-6 lg:text-7xl font-black lg:mb-44 text-center lg:text-left">
            Crear una cuenta
          </p>
        </div>
      </div>

      <div className="my-auto lg:px-14 py-10">
        <div className="bg-white py-8 px-10 mx-10 rounded-lg">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
