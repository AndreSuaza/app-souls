import { getCosmeticStoreDataAction } from "@/actions";
import { CosmeticStoreView } from "@/components/tienda/CosmeticStoreView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tienda de cosméticos | Souls In Xtinction",
  description:
    "Desbloquea avatares, banners y marcos usando Puntos de Victoria en la tienda oficial de cosméticos de Souls In Xtinction.",
  keywords: [
    "Souls In Xtinction",
    "tienda",
    "cosméticos",
    "avatares",
    "banners",
    "marcos",
    "puntos de victoria",
  ],
  alternates: {
    canonical: "https://soulsinxtinction.com/tienda",
  },
  openGraph: {
    title: "Tienda de cosméticos | Souls In Xtinction",
    description:
      "Desbloquea avatares, banners y marcos usando Puntos de Victoria en la tienda oficial de cosméticos de Souls In Xtinction.",
    url: "https://soulsinxtinction.com/tienda",
    siteName: "Souls In Xtinction",
    images: [
      {
        url: "https://soulsinxtinction.com/souls-in-xtinction.webp",
        width: 800,
        height: 600,
        alt: "Tienda de cosméticos Souls In Xtinction",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function TiendaPage() {
  const data = await getCosmeticStoreDataAction();
  return <CosmeticStoreView initialData={data} />;
}
