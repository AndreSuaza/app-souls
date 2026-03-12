import { PikingosHeroSection } from "@/components/productos/pikingos/PikingosHeroSection";
import { PikingosShowcaseSection } from "@/components/productos/pikingos/PikingosShowcaseSection";
import { PikingosInfoSection } from "@/components/productos/pikingos/PikingosInfoSection";
import { PikingosCollectionSection } from "@/components/productos/pikingos/PikingosCollectionSection";
import { getDecksByIds, getProductUrl } from "@/actions";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pikingos - Souls In Xtinction TCG",
  description:
    "Pikingos es una coleccion de Souls In Xtinction TCG inspirada en la mitologia nordica, con cartas agresivas y directas para imponer su ley.",
  openGraph: {
    title: "Pikingos - Souls In Xtinction TCG",
    description:
      "Pikingos es una coleccion de Souls In Xtinction TCG inspirada en la mitologia nordica, con cartas agresivas y directas para imponer su ley.",
    url: "https://soulsinxtinction.com/productos/pikingos",
    siteName: "Pikingos",
    images: [
      {
        url: "https://soulsinxtinction.com/products/pikingos/logo_pik.webp",
        width: 500,
        height: 500,
        alt: "Pikingos Souls In Xtinction TCG",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export default async function Page() {
  const product = await getProductUrl("pikingos");

  if (!product) {
    notFound();
  }

  const { mainDeck, sideDeck } = await getDecksByIds(product.deckCards ?? "");
  const decklist = [...mainDeck, ...sideDeck];

  return (
    <>
      {/* Referencia modo light: text-slate-900 y before:from-slate-50/70 before:via-slate-100/70 before:to-slate-200/70 */}
      <h1 className="sr-only">Productos Pikingos</h1>
      <main className="relative isolate min-h-screen bg-[url('/products/pikingos/Fondo.webp')] bg-cover bg-center bg-fixed text-white before:absolute before:inset-0 before:z-0 before:bg-gradient-to-br before:from-tournament-dark-bg/75 before:via-tournament-dark-muted/75 before:to-tournament-dark-bg/75 before:content-['']">
        <div className="relative z-10">
          <PikingosHeroSection />
          <PikingosShowcaseSection />
          <PikingosInfoSection />
          <PikingosCollectionSection decklist={decklist} />
        </div>
      </main>
    </>
  );
}
