
import { getAvatars, getDecksByUser } from "@/actions";
import { getUserById } from "@/actions/auth/find-user";
import { auth } from "@/auth";
import { Pefil } from "@/components/perfil/perfil";
import { redirect } from "next/navigation";

export default async function PerfilPage() {

  const session = await auth();
  
  if (session?.user?.role !== "admin") {
      redirect( '/auth/login' );
  }

  const user = await getUserById();
  const avatars = await getAvatars();
  const userDecks = await getDecksByUser();

  console.log(userDecks);

  return (
    <>{user && <Pefil user={user} avatars={avatars} decks={userDecks}/>}</>
    
  )
}