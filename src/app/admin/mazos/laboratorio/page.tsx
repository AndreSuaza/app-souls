import {
  getDeckById,
  getDeckFiltersAction,
  getDecksByIds,
  getPaginatedCards,
  getPropertiesCards,
} from "@/actions";
import { auth } from "@/auth";
import { DeckCreator } from "@/components";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    page?: string;
    text?: string;
    products?: string;
    types?: string;
    archetypes?: string;
    keywords?: string;
    costs?: string;
    forces?: string;
    defenses?: string;
    raritys?: string;
    decklist?: string;
    rarities?: string;
    limit?: string;
    id?: string;
  }>;
}

export default async function Page({ searchParams }: Props) {
  const session = await auth();
  if (session?.user.role !== "admin") {
    notFound();
  }

  const {
    text,
    products,
    types,
    archetypes,
    keywords,
    costs,
    forces,
    defenses,
    page,
    decklist,
    rarities,
    limit,
    id = "",
  } = await searchParams;
  const page2 = page ? parseInt(page) : 1;

  const [propertiesCards, deckFilters] = await Promise.all([
    getPropertiesCards(),
    getDeckFiltersAction(),
  ]);
  const { cards, totalPage, totalCount, perPage } = await getPaginatedCards({
    page: page2,
    text,
    products,
    types,
    archetypes,
    keywords,
    costs,
    forces,
    defenses,
    rarities,
    limit,
  });

  let decklistCards = decklist;
  let deckUser = null;

  if (id) {
    const getDeck = await getDeckById(id);
    if (!getDeck || !getDeck.isAdminDeck) {
      notFound();
    }
    deckUser = getDeck;
    decklistCards = deckUser.cards.replaceAll("%2C", ",");
  }

  const { mainDeck } = await getDecksByIds(decklistCards);

  return (
    <DeckCreator
      cards={cards}
      propertiesCards={propertiesCards}
      mainDeck={mainDeck}
      sideDeck={[]}
      totalPages={totalPage}
      totalCards={totalCount}
      perPage={perPage}
      initialPage={page2}
      className="h-full min-h-0"
      initialFilters={{
        text,
        products,
        types,
        archetypes,
        keywords,
        costs,
        forces,
        defenses,
        rarities,
        limit,
      }}
      hasSession={Boolean(session?.user)}
      archetypes={deckFilters.archetypes}
      deckId={deckUser?.id}
      deckData={deckUser}
      isOwnerDeck={Boolean(deckUser?.id)}
      canEditDeck
      canDeleteDeck={Boolean(deckUser?.id)}
      disableDeckRules
      singleDeck
      singleDeckTitle="Mazo"
      showShareButton={false}
      showUserDecksButton={false}
      forcePrivateSave
      isAdminDeck
      skipDeckLimitCheck
      enableBulkAdd
    />
  );
}
