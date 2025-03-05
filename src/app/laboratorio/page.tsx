import { getPaginatedCards, getPropertiesCards } from "@/actions";
import { DeckCreator, Pagination, Sidebar, Title, TopMenu } from "@/components";

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
  }
}

export default async function Cards({ searchParams }: Props) {

  const { costs } = searchParams;
  const page = searchParams.page ? parseInt( searchParams.page ) : 1;
  const propertiesCards = await getPropertiesCards();
  const { cards, currentPage, totalPage } = await getPaginatedCards({ page });

  return (
    <main className="">
            <TopMenu/>
            <Sidebar/>
            <div className="h-screen overflow-auto">
              <DeckCreator cards={cards}/>

              <div className="grid grid-cols-4">
                <div className="col-span-2 lg:col-span-3"><Pagination totalPages={totalPage}/></div>
                
              </div>

            </div>
        </main>
    
  )
}
