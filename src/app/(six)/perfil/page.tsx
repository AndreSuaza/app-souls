
import { getAvatars } from "@/actions";
import { getUserById } from "@/actions/auth/find-user";
import { auth } from "@/auth";
import { Pefil } from "@/components/perfil/perfil";
import { redirect } from "next/navigation";

export default async function PerfilPage() {

  const session = await auth();
  
  if (!session?.user) {
    redirect( '/auth/login' );
  }

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