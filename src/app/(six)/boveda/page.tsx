import { getPaginatedPricesCards, getPropertiesCards } from "@/actions";
import { CardFinderPrices, Pagination, Title } from "@/components";
import { Metadata } from "next";
import Image from "next/image";

interface Props {
  searchParams: {
    page?: string;
    products?: string;
    rarities?: string;
    orden: string;
  }
}

export const metadata: Metadata = {
  title: 'Boveda - Referencia precios de las cartas de souls in xtiction',
  description: 'Consulta una referencia de los precios actualizados de las cartas coleccionables de Souls In Xtinction TCG en un solo lugar. Encuentra el valor de cada carta, desde las más comunes hasta las más raras y codiciadas.',
  openGraph: {
      title: 'Boveda - Referencia precios de las cartas de souls in xtiction',
      description: 'Consulta una referencia de los precios actualizados de las cartas coleccionables de Souls In Xtinction TCG en un solo lugar. Encuentra el valor de cada carta, desde las más comunes hasta las más raras y codiciadas.',
      url: 'https://soulsinxtinction.com/boveda',
      siteName: 'Boveda - Souls In Xtinction',
      images: [
          {
          url: 'https://soulsinxtinction.com/boveda.webp',
          width: 800,
          height: 600,
          alt: 'Boveda Souls In Xtinction TCG',
          }
      ],
      locale: 'en_ES',
      type: 'website',
  },
}

export default async function BovedaPage({ searchParams }: Props) {

  const { products,  page, rarities, orden } = searchParams;
  const page2 = page ? parseInt( page ) : 1 

  const propertiesCards = await getPropertiesCards();
  const { cards, totalPage } = await getPaginatedPricesCards({ page: page2, products, rarities, orden });

  return (
    <>
     <Title 
        title="Boveda"
      />
      <CardFinderPrices propertiesCards={propertiesCards}/>
      <ul className="grid gap-4 mx-4 mt-6 mb-10 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {cards.map(card =>
          
          <li key={card.id} className="grid grid-cols-2 bg-gray-100 rounded-md shadow-md" >
          
            <Image
                src={`/cards/${card.code}-${card.idd}.webp`}
                alt={card.name}
                className='w-full object-cover rounded-lg'
                width={500}
                height={718}
            />
            <div className="mx-4 mb-4">
              <h4 className="font-bold h-12 my-2 overflow-hidden">{card.name}</h4>
              <ul>
                <p className="mt-2 text-gray-500 text-xs">{card.product.name}</p>
                <p className="mb-4 text-gray-500 text-xs">{card.code}-{card.idd}</p>
                {card.price.map((price, index) => 
                <li key={index}>
                  <p className=""><b>{price.rarity.name}:</b> <span className="text-green-600 font-semibold">${price.price}</span></p>
                </li>)}
              </ul>
            </div>
          
          </li>
        )}
        </ul>

      <Pagination totalPages={totalPage}/>
    </>
  )
}
