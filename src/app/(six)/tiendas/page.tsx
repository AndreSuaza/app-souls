import { getStorePagination } from "@/actions";
import { Title } from "@/components";
import { StoreGrid } from "@/components/stores/store-grid/StoreGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Tiendas Oficiales de Souls In Xtinction TCG | Encuentra Cartas y Mazos',
  description: 'Encuentra las mejores tiendas oficiales y puntos de venta de Souls In Xtinction TCG. Compra cartas coleccionables, mazos y expansiones en distribuidores confiables. ¡Consigue lo que necesitas para mejorar tu estrategia en este TCG competitivo!',
  openGraph: {
    title: 'Tiendas Oficiales de Souls In Xtinction TCG | Encuentra Cartas y Mazos',
      description: 'Encuentra las mejores tiendas oficiales y puntos de venta de Souls In Xtinction TCG. Compra cartas coleccionables, mazos y expansiones en distribuidores confiables. ¡Consigue lo que necesitas para mejorar tu estrategia en este TCG competitivo!',
      url: 'https://soulsinxtinction.com/tiendas',
      siteName: 'Productos de Souls In Xtinction TCG',
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

export default async function TiendasPage() {

  const stores = await getStorePagination();

  return (
    <>
    <Title 
      title="Tiendas"
    />
    
    <StoreGrid stores={stores}/>

    </>
  )
}
