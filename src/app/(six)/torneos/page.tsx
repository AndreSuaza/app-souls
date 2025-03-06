
import { getTournamentsPagination } from "@/actions";
import { Pagination, Title, TournamentGrid } from "@/components";

interface Props {
  searchParams: {
    page?: string;
  }
}

export default async function EventosPage({ searchParams }: Props) {

  const take = 5;

  const page = searchParams.page ? parseInt( searchParams.page ) : 1;
  const { tournaments, totalPage } = await getTournamentsPagination({ page, take, types:["Tier 1","Tier 2","Tier 3"] });
  const { tournaments: tournamentsT1 } = await getTournamentsPagination({ types:["Tier 4"] });

  return (
    <>
    <Title
      title="Torneos"
      className="mb-3 lg:mb-6"
    />

    <div className="grid grid-cols-1 md:grid-cols-3 xl:mx-10 m-2">
      
      <div className="px-4 col-span-2">
        <h2 className="text-4xl font-bold my-6 uppercase ">Torneos élite</h2>
        <TournamentGrid
              tournaments={tournaments}
          />
        <Pagination totalPages={totalPage}/>
      </div>
      
      <div className="md:ml-4">
        <div className="bg-indigo-500 px-4 rounded-lg pb-4">
          <h2 className="text-white text-4xl font-bold pt-4 mb-6 uppercase">Torneos Semanales</h2>
          <TournamentGrid
              tournaments={tournamentsT1}
              short={true}
          />
        </div>
      </div>
    </div>

     
    </>
  )
}
