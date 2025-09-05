import { getDecksByIds} from "@/actions";
import { DeckDetail} from "@/components";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: 'Biblioteca de Mazos | La biblioteca donde nacen y evolucionan los mejores mazos de Souls In Xtinction TCG',
  description: 'Explora, comparte y descubre mazos creados por la comunidad',
  openGraph: {
    title: 'Biblioteca de Mazos | La biblioteca donde nacen y evolucionan los mejores mazos de Souls In Xtinction TCG',
    description: 'Explora, comparte y descubre mazos creados por la comunidad',
      url: 'https://soulsinxtinction.com/mazos',
      siteName: 'Biblioteca de Mazos Souls In Xtinction TCG',
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
  }>
}

export default async function Cards({ searchParams }: Props) {

  const { decklist } = await searchParams;

  const {mainDeck, sideDeck} = await getDecksByIds(decklist); 

  return (

    <main className="grid grid-cols-2 lg:grid-cols-4 mb-6">
      <div className="mx-2 mt-6">
        <h1>Nombre del mazo</h1>
        <h2>Jugador</h2>
        <p>video</p>
        <p>compartir</p>
        <p>Editar</p>
        <p>posicion</p>
        <p>evento</p>
        <p>fecha</p>
        <p>publico</p>
        <p>comentarios</p>
        <p>Code</p>
        <p>User</p>
      </div>
      <div className="col-span-1 md:col-span-3 mt-6 mx-2">
        <DeckDetail mainDeck={mainDeck} sideDeck={sideDeck}/>
      </div>  
    </main>
    
  )
}
