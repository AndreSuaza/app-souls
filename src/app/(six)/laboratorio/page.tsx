import { getPaginatedCards, getPropertiesCards } from "@/actions";
import { CardGrid, DeckCreator, Pagination, Title } from "@/components";

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
    <>
    <Title
      title="Laboratorio"
    />

    <DeckCreator cards={cards}/>


    <Pagination totalPages={totalPage}/>

    </>
  )
}
