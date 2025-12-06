import Image from "next/image";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "./ui/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/auth/login");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 bg-gray-800 min-h-screen bg-[url(/bg-registro.webp)] bg-cover bg-fixed">
      <div className="lg:h-screen text-white">
        <div className="mt-16 mx-auto lg:ml-16">
          <div className="relative w-[300px] h-[61px] lg:w-[446px] lg:h-[85px] mx-auto lg:mx-0">
            <Image fill src="/souls-in-xtinction-logo-white.webp" alt="Logo" />
          </div>

          <p className="uppercase text-2xl mt-4 lg:mt-6 lg:text-7xl font-black lg:mb-44 text-center lg:text-left">
            Nueva contraseña
          </p>
        </div>
      </div>

      <div className="lg:my-auto py-8 lg:px-14">
        <div className="bg-white py-6 lg:py-8 px-10 lg:px-14 mx-10 rounded-lg">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
