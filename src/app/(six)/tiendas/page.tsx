import { getStoresByDistanceAction } from "@/actions";
import { StoresExplorer } from "@/components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tiendas Souls In Xtinction TCG | Cartas y mazos",
  description: "Encuentra tiendas oficiales y puntos de venta de Souls In Xtinction TCG. Compra cartas, mazos y expansiones en distribuidores confiables, con ubicaciones y contacto directo para planear tu proxima visita.",
  keywords: [
    "Souls In Xtinction",
    "tiendas",
    "cartas",
    "mazos",
    "TCG",
    "puntos de venta",
  ],
  alternates: {
    canonical: "https://soulsinxtinction.com/tiendas",
  },
  openGraph: {
    title: "Tiendas Souls In Xtinction TCG | Cartas y mazos",
    description: "Encuentra tiendas oficiales y puntos de venta de Souls In Xtinction TCG. Compra cartas, mazos y expansiones en distribuidores confiables, con ubicaciones y contacto directo para planear tu proxima visita.",
    url: "https://soulsinxtinction.com/tiendas",
    siteName: "Tiendas Souls In Xtinction TCG",
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

const FALLBACK_POSITION = {
  lat: 4.711,
  lng: -74.0721,
};

export const revalidate = 3600;

export default async function TiendasPage() {
  const initialData = await getStoresByDistanceAction({
    lat: FALLBACK_POSITION.lat,
    lng: FALLBACK_POSITION.lng,
    page: 1,
    perPage: 10,
  });

  return (
    <>
      <h1 className="sr-only">Tiendas Souls In Xtinction TCG</h1>
      <StoresExplorer
        initialData={initialData}
        initialPosition={FALLBACK_POSITION}
      />
    </>
  );
}
