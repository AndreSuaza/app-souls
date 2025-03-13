import { getProductsPagination } from "@/actions";
import { ProductGrid, Title } from "@/components";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: 'Descubre los Productos de Souls In Xtinction TCG | Cartas, Mazos y Expansiones',
  description: 'Explora todos los productos de Souls In Xtinction TCG, desde mazos de inicio hasta expansiones exclusivas. Encuentra las mejores cartas coleccionables, mejora tu estrategia y domina el juego con el contenido más reciente. ¡Descubre lo último en este TCG competitivo!',
  openGraph: {
    title: 'Descubre los Productos de Souls In Xtinction TCG | Cartas, Mazos y Expansiones',
      description: 'Explora todos los productos de Souls In Xtinction TCG, desde mazos de inicio hasta expansiones exclusivas. Encuentra las mejores cartas coleccionables, mejora tu estrategia y domina el juego con el contenido más reciente. ¡Descubre lo último en este TCG competitivo!',
      url: 'https://soulsinxtinction.com/productos',
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

export default async function ProductosPage() {

  const products = await getProductsPagination();

  return (
    <>
    <Title 
      title="Productos"
    />

    <ProductGrid 
      products={products}
    />
    </>
  )
}
