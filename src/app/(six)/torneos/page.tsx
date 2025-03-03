
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
  const { tournaments, currentPage, totalPage } = await getTournamentsPagination({ page, take });
  
  return (
    <>
    <Title
      title="Torneos"
    />

    <div className="grid grid-cols-1 md:grid-cols-3 lg:mx-40 m-2">
      <div className="bg-indigo-300 px-4 rounded-lg md:mr-4">
        <h2 className="text-white text-4xl font-bold my-4">Torneos Semanales</h2>
        <TournamentGrid
            tournaments={tournaments}
            short={true}
        />
      </div>
      <div className="bg-indigo-400 px-4 rounded-lg col-span-2">
        <h2 className="text-white text-4xl font-bold my-4">Torneos élite</h2>
        <TournamentGrid
              tournaments={tournaments}
          />
        <Pagination totalPages={totalPage}/>
      </div>
      
    </div>

     
    </>
  )
}
