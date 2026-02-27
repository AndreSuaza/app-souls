import { getStoresByDistanceAction } from "@/actions";
import { StoresExplorer } from "@/components";
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

const FALLBACK_POSITION = {
  lat: 4.711,
  lng: -74.0721,
};

export const dynamic = "force-dynamic";

export default async function TiendasPage() {
  const initialData = await getStoresByDistanceAction({
    lat: FALLBACK_POSITION.lat,
    lng: FALLBACK_POSITION.lng,
    page: 1,
    perPage: 10,
  });

  return (
    <StoresExplorer
      initialData={initialData}
      initialPosition={FALLBACK_POSITION}
    />
  );
}
