import { getAvatars, getActiveTournament, getUserTournaments } from "@/actions";
import { getUserById } from "@/actions/auth/find-user";
import { Pefil } from "@/components/perfil/perfil";

export default async function PerfilPage() {
  const user = await getUserById();
  const avatars = await getAvatars();
  const activeTournament = await getActiveTournament();
  const tournaments = await getUserTournaments();
  // const userDecks = await getDecksByUser();

  return (
    <>
      {user && (
        <Pefil
          user={user}
          avatars={avatars}
          activeTournament={activeTournament}
          tournaments={tournaments}
        />
      )}
    </>
  );
}
