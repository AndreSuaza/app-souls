import { getDecksByIds, getProductUrl } from "@/actions";
import { CataclismoCollectionSection } from "@/components/productos/cataclismo/CataclismoCollectionSection";
import { CataclismoDuoCardsSection } from "@/components/productos/cataclismo/CataclismoDuoCardsSection";
import { CataclismoHeroSection } from "@/components/productos/cataclismo/CataclismoHeroSection";
import { CataclismoInfoSection } from "@/components/productos/cataclismo/CataclismoInfoSection";
import { CataclismoQuadCardsSection } from "@/components/productos/cataclismo/CataclismoQuadCardsSection";
import { CataclismoShowcaseSection } from "@/components/productos/cataclismo/CataclismoShowcaseSection";
import { CataclismoSplitSection } from "@/components/productos/cataclismo/CataclismoSplitSection";
import { Metadata } from "next";
import type { Decklist } from "@/interfaces";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cataclismo - Souls In Xtinction TCG",
  description:
    "Cataclismo es una coleccion de Souls In Xtinction TCG marcada por el caos y el poder, con cartas que desatan una energia imparable.",
  openGraph: {
    title: "Cataclismo - Souls In Xtinction TCG",
    description:
      "Cataclismo es una coleccion de Souls In Xtinction TCG marcada por el caos y el poder, con cartas que desatan una energia imparable.",
    url: "https://soulsinxtinction.com/productos/cataclismo",
    siteName: "Cataclismo",
    images: [
      {
        url: "https://soulsinxtinction.com/products/cataclismo/logo_cataclismo.png",
        width: 500,
        height: 500,
        alt: "Cataclismo Souls In Xtinction TCG",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export default async function Page() {
  const product = await getProductUrl("cataclismo");

  // Si el producto no existe todavia, mostramos la pagina igual y
  // dejamos el mazo en estado vacio para evitar un 404 innecesario.
  let decklist: Decklist[] = [];

  if (product) {
    const { mainDeck, sideDeck } = await getDecksByIds(product.deckCards ?? "");
    decklist = [...mainDeck, ...sideDeck];
  }

  return (
    <>
      <h1 className="sr-only">Productos Cataclismo</h1>
      <main className="relative isolate min-h-screen bg-[url('/products/cataclismo/bg-cataclismo.jpg.jpeg')] bg-cover bg-center bg-fixed text-white before:absolute before:inset-0 before:z-0 before:bg-gradient-to-br before:from-[#17050a]/70 before:via-[#2a0b12]/70 before:to-[#120308]/70 before:content-['']">
        <div className="relative z-10">
          <CataclismoHeroSection />
          <CataclismoDuoCardsSection />
          <CataclismoShowcaseSection />
          <CataclismoQuadCardsSection />
          <CataclismoSplitSection />
          <CataclismoInfoSection />
          <CataclismoCollectionSection decklist={decklist} />
        </div>
      </main>
    </>
  );
}
