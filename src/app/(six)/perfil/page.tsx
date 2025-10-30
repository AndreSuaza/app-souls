
import { getAvatars } from "@/actions";
import { getUserById } from "@/actions/auth/find-user";
import { Pefil } from "@/components/perfil/perfil";
import { redirect } from "next/navigation";

export default async function PerfilPage() {

  const user = await getUserById();

  if (!user) {
      redirect( '/auth/login' );
  }

  const avatars = await getAvatars();
  // const userDecks = await getDecksByUser();

  return (
    <>{user && <Pefil user={user} avatars={avatars}/>}</>
    
  )
}