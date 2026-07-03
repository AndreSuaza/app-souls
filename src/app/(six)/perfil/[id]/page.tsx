import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPublicDeckCountsAction } from "@/actions/profile/get-public-deck-counts.action";
import { getPublicProfileAction } from "@/actions/profile/get-public-profile.action";
import { getPublicUserTournamentsAction } from "@/actions/profile/get-public-user-tournaments.action";
import { getPublicDecksByUserAction } from "@/actions/decks/get-public-decks-by-user.action";
import { ProfilePublicView } from "@/components/perfil/ProfilePublicView";

type Props = {
  params: Promise<{ id: string }>;
};

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Perfil público | Souls In Xtinction TCG",
  description:
    "Explora el perfil público de jugadores de Souls In Xtinction TCG, con su historial de torneos y mazos publicados.",
};

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  const user = await getPublicProfileAction({ nickname: id });

  if (!user) {
    notFound();
  }

  const [tournaments, deckCounts, deckLibrary] = await Promise.all([
    getPublicUserTournamentsAction({ userId: user.id }),
    getPublicDeckCountsAction({ userId: user.id }),
    getPublicDecksByUserAction({
      userId: user.id,
      tournament: "with",
      date: "recent",
      likes: false,
      page: 1,
      archetypeId: "",
      includeLikedDeckIds: false,
    }),
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
        likedDeckIds: [],
      }}
      hasSession={false}
    />
  );
}
