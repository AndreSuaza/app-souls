import { getCardsByIds, getPaginatedCards, getPropertiesCards } from "@/actions";
import { DeckCreator, Pagination, Sidebar, TopMenu } from "@/components";
import { Archetype, Keyword, Product, Rarity, Type } from "@/interfaces";

interface Props {
  searchParams: {
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
  }
}

export default async function Cards({ searchParams }: Props) {

  const { text, products, types, archetypes, keywords, costs, forces, defenses, page, decklist } = await searchParams;
  const page2 = page ? parseInt( page ) : 1 

  const propertiesCards = await getPropertiesCards();
  const { cards, currentPage, totalPage } = await getPaginatedCards({ page: page2, text, products, types, archetypes, keywords, costs, forces, defenses });

  const deck = await getCardsByIds(decklist); 

  return (
    <main className="">
            <TopMenu/>
            <Sidebar/>
            <div className="h-screen overflow-auto">
              <DeckCreator cards={cards} propertiesCards={propertiesCards} deck={deck}/>

              <div className="grid grid-cols-4">
                <div className="col-span-2 lg:col-span-3"><Pagination totalPages={totalPage}/></div>
                
              </div>

            </div>
        </main>
    
  )
}
