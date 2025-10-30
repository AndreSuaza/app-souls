import { getDecks} from "@/actions";
import { DeckCard, Title} from "@/components";
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

export default async function Decks() {

  const decks = await getDecks();

  return (
    <>
    <Title 
      title="Biblioteca de Mazos"
    />
    <section className="px-6 md:px-20 my-6">
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-16">
      {decks.map(deck => 
        <li key={deck.id}>
        <DeckCard mazo={deck}/>
        </li>
      )}
      </ul>
    </section>  
    </>
  )
}
