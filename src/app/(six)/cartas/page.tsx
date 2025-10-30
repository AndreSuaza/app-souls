import { getPaginatedCards, getPropertiesCards } from "@/actions";
import { CardFinder, Title } from "@/components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Laboratorio de Mazos | Crea y Optimiza tu Estrategia en Souls In Xtinction TCG',
  description: 'Diseña el mazo perfecto en el Laboratorio de Mazos de Souls In Xtinction TCG. Prueba combinaciones, ajusta estrategias y optimiza tu juego con nuestras herramientas avanzadas. ¡Prepara tu mazo y domina el campo de batalla!',
  openGraph: {
    title: 'Laboratorio de Mazos | Crea y Optimiza tu Estrategia en Souls In Xtinction TCG',
    description: 'Diseña el mazo perfecto en el Laboratorio de Mazos de Souls In Xtinction TCG. Prueba combinaciones, ajusta estrategias y optimiza tu juego con nuestras herramientas avanzadas. ¡Prepara tu mazo y domina el campo de batalla!',
      url: 'https://soulsinxtinction.com/tiendas',
      siteName: 'Laboratorio Souls In Xtinction TCG',
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
    rarities?: string;
    limit?: string;
  }>
}

export default async function Cards({ searchParams }: Props) {

  const { text, products, types, archetypes, keywords, costs, forces, defenses, page, rarities, limit } = await searchParams;
  const page2 = page ? parseInt( page ) : 1 

  const propertiesCards = await getPropertiesCards();
  const { cards, totalPage } = await getPaginatedCards({ page: page2, text, products, types, archetypes, keywords, costs, forces, defenses, rarities, limit });

  return (
    <div>
      <Title 
        title="Biblioteca de cartas"
      />
      <CardFinder cards={cards} propertiesCards={propertiesCards} totalPage={totalPage}/>
    </div>
    
  )
}
