
import { auth } from "@/auth";
import { ButtonLogOut } from "@/components";
export default async function PerfilPage() {

  const session = await auth();

  return (
    <div className="md:mx-40 my-6">
    <h1>Perfil</h1>
    {JSON.stringify(session)}
    <ButtonLogOut>
      <span>Login con out</span>
    </ButtonLogOut>
    </div>
  )
}