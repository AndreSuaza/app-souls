import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./ui/LoginForm";
import { ButtonLogOut, ButtonSocial } from "@/components";
import { signOut } from "next-auth/react";

export default async function LogInPage() {

  const session = await auth();

  console.log('sesion',session)
  // if ( session?.user ) {
  //   redirect('/auth/new-account');
  // }

  return (
    <div className="flex flex-col min-h-screen pt-32 sm:pt-52">
      <h1 className="text-center text-xl font-semibold mb-6">Accede a tu cuenta y continúa tu aventura.</h1>
      {/* <LoginForm/> */}
      <ButtonSocial provider="google">
        <span>Login con google</span>
      </ButtonSocial>
      <ButtonLogOut>
        <span>Login con out</span>
      </ButtonLogOut>
    </div>
  );
}
