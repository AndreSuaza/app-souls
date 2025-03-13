
import { getTournamentsPagination } from "@/actions";
import { Pagination, Title, TournamentGrid } from "@/components";
import { Metadata } from "next";

interface Props {
  searchParams: {
    page?: string;
  }
}

export const metadata: Metadata = {
  title: 'Torneos de Souls In Xtinction TCG | Compite y Demuestra tu Habilidad',
  description: 'Participa en los torneos oficiales de Souls In Xtinction TCG y enfréntate a los mejores jugadores. Consulta fechas, inscripciones, reglas y premios.',
  openGraph: {
    title: 'Torneos de Souls In Xtinction TCG | Compite y Demuestra tu Habilidad',
      description: 'Participa en los torneos oficiales de Souls In Xtinction TCG y enfréntate a los mejores jugadores. Consulta fechas, inscripciones, reglas y premios.',
      url: 'https://soulsinxtinction.com/tiendas',
      siteName: 'Torneos Souls In Xtinction TCG',
      images: [
          {
          url: 'https://soulsinxtinction.com/souls-in-xtinction.webp',
          width: 800,
          height: 600,
          alt: 'Souls In Xtinction TCG',
          }
      ],
      locale: 'en_ES',
      type: 'website',
  },
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
