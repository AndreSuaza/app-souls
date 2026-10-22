import {
  getDeckById,
  getDeckFiltersAction,
  getDecksByIds,
  getTokenDeckByIds,
  getPaginatedCards,
  getPropertiesCards,
} from "@/actions";
import { auth } from "@/auth";
import { DeckCreator } from "@/components/cartas/deck-creator/DeckCreator";
import { notFound } from "next/navigation";
import Link from "next/link";

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
    decklistCards = deckUser.cards ?? decklist;
  }

  const [{ mainDeck }, tokenDeck] = await Promise.all([
    getDecksByIds(decklistCards),
    getTokenDeckByIds(deckUser?.tokenCards),
  ]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          {deckUser ? "Editar mazo" : "Crear mazo"}
        </h1>
        <Link
          href="/admin/mazos"
          className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-purple-400 hover:text-purple-700 dark:border-tournament-dark-border dark:text-slate-200 dark:hover:border-purple-400 dark:hover:text-purple-200"
        >
          Cancelar
        </Link>
      </div>

      <div className="min-h-0 flex-1">
        <DeckCreator
          cards={cards}
          propertiesCards={propertiesCards}
          mainDeck={mainDeck}
          tokenDeck={tokenDeck}
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
      </div>
    </div>
  );
}
