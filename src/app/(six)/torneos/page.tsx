
import { getTournamentsPagination } from "@/actions";
import { Title, TournamentGrid } from "@/components";

export default async function EventosPage() {

  const tournaments = await getTournamentsPagination();
  
  return (
    <>
    <Title
      title="Torneos"
    />

    <div className="grid grid-cols-3 mx-40">
      <div className="bg-red-200 col-span-2">
        <TournamentGrid
              tournaments={tournaments}
          />
      </div>
      <div className="bg-blue-300">
        <TournamentGrid
                tournaments={tournaments}
            />
      </div>
    </div>

    

    </>
  )
}
