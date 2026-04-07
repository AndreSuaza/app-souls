import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getPublicProfileAction,
  getPublicUserTournamentsAction,
  getPublicDeckCountsAction,
  getPublicDecksByUserAction,
} from "@/actions";
import { ProfilePublicView } from "@/components/perfil/ProfilePublicView";
import { auth } from "@/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Perfil publico | Souls In Xtinction TCG",
  description:
    "Explora el perfil publico de jugadores de Souls In Xtinction TCG, con su historial de torneos y mazos publicados.",
};

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  const user = await getPublicProfileAction({ nickname: id });

  if (!user) {
    notFound();
  }

  const [tournaments, deckCounts, deckLibrary, session] = await Promise.all([
    getPublicUserTournamentsAction({ userId: user.id }),
    getPublicDeckCountsAction({ userId: user.id }),
    getPublicDecksByUserAction({
      userId: user.id,
      tournament: "with",
      date: "recent",
      likes: false,
      page: 1,
      archetypeId: "",
    }),
    auth(),
  ]);

  return (
    <ProfilePublicView
      user={user}
      tournaments={tournaments}
      publicDecksCount={deckCounts.publicDecks}
      deckLibrary={{
        decks: deckLibrary.decks,
        pagination: {
          totalCount: deckLibrary.totalCount,
          totalPages: deckLibrary.totalPages,
          currentPage: deckLibrary.currentPage,
          perPage: deckLibrary.perPage,
        },
        likedDeckIds: deckLibrary.likedDeckIds,
      }}
      hasSession={Boolean(session?.user?.idd)}
    />
  );
}
