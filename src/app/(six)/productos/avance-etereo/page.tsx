import { getDecksByIds, getProductUrl } from "@/actions";
import { AvanceEtereoCardsCarouselSection } from "@/components/productos/avance-etereo/AvanceEtereoCardsCarouselSection";
import { AvanceEtereoCollectionSection } from "@/components/productos/avance-etereo/AvanceEtereoCollectionSection";
import { AvanceEtereoHeroSection } from "@/components/productos/avance-etereo/AvanceEtereoHeroSection";
import { AvanceEtereoProductBoxSection } from "@/components/productos/avance-etereo/AvanceEtereoProductBoxSection";
import { AvanceEtereoSplitSection } from "@/components/productos/avance-etereo/AvanceEtereoSplitSection";
import type { Decklist } from "@/interfaces";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Avance Etéreo - Souls In Xtinction TCG",
  description:
    "Avance Etéreo es una colección de Souls In Xtinction TCG marcada por criaturas místicas, energía espiritual y cartas de rareza ascendida.",
  openGraph: {
    title: "Avance Etéreo - Souls In Xtinction TCG",
    description:
      "Avance Etéreo es una colección de Souls In Xtinction TCG marcada por criaturas místicas, energía espiritual y cartas de rareza ascendida.",
    url: "https://soulsinxtinction.com/productos/avance-etereo",
    siteName: "Avance Etéreo",
    images: [
      {
        url: "https://soulsinxtinction.com/products/avance-etereo/logo.jpg",
        width: 2542,
        height: 1308,
        alt: "Avance Etéreo Souls In Xtinction TCG",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export default async function Page() {
  const product = await getProductUrl("avance-etereo");

  // Si el producto no existe todavia, mostramos la pagina igual y
  // dejamos el mazo en estado vacio para evitar un 404 innecesario.
  let decklist: Decklist[] = [];

  if (product) {
    const { mainDeck, sideDeck } = await getDecksByIds(product.deckCards ?? "");
    decklist = [...mainDeck, ...sideDeck];
  }

  return (
    <>
      <h1 className="sr-only">Productos Avance Etéreo</h1>
      <main className="relative isolate min-h-screen bg-[url('/products/avance-etereo/background.jpg')] bg-cover bg-center bg-fixed text-white before:absolute before:inset-0 before:z-0 before:bg-gradient-to-br before:from-[#081018]/75 before:via-[#102028]/72 before:to-[#180d24]/75 before:content-['']">
        <div className="relative z-10">
          <AvanceEtereoHeroSection />
          <AvanceEtereoCardsCarouselSection />
          <AvanceEtereoSplitSection />
          <AvanceEtereoProductBoxSection />
          <AvanceEtereoCollectionSection decklist={decklist} />
        </div>
      </main>
    </>
  );
}
