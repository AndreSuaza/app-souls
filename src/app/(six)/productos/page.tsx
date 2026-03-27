import { getProductsPagination } from "@/actions";
import { ProductGrid } from "@/components";
import { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Productos Souls In Xtinction TCG | Catalogo",
  description:
    "Explora todos los productos de Souls In Xtinction TCG, desde mazos de inicio hasta expansiones exclusivas. Encuentra las mejores cartas coleccionables, mejora tu estrategia y domina el juego con el contenido más reciente. ¡Descubre lo último en este TCG competitivo!",
  keywords: [
    "Souls In Xtinction",
    "productos",
    "catalogo",
    "TCG",
    "mazos",
    "expansiones",
  ],
  alternates: {
    canonical: "https://soulsinxtinction.com/productos",
  },
  openGraph: {
    title: "Productos Souls In Xtinction TCG | Catalogo",
    description:
      "Explora todos los productos de Souls In Xtinction TCG, desde mazos de inicio hasta expansiones exclusivas. Encuentra las mejores cartas coleccionables, mejora tu estrategia y domina el juego con el contenido más reciente. ¡Descubre lo último en este TCG competitivo!",
    url: "https://soulsinxtinction.com/productos",
    siteName: "Productos de Souls In Xtinction TCG",
    images: [
      {
        url: "https://soulsinxtinction.com/souls-in-xtinction.webp",
        width: 800,
        height: 600,
        alt: "Souls In Xtinction TCG",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export default async function ProductosPage() {
  const products = await getProductsPagination();

  return (
    <>
      <h1 className="sr-only">Catalogo de productos</h1>
      <ProductGrid products={products} />
    </>
  );
}
