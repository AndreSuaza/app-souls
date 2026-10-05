import { getDecksByIds, getProductUrl } from "@/actions";
import { ObsidianaCollectionSection } from "@/components/productos/obsidiana-y-tempestad/ObsidianaCollectionSection";
import { ObsidianaDevoraSection } from "@/components/productos/obsidiana-y-tempestad/ObsidianaDevoraSection";
import { ObsidianaHeroSection } from "@/components/productos/obsidiana-y-tempestad/ObsidianaHeroSection";
import { ObsidianaPackagesSection } from "@/components/productos/obsidiana-y-tempestad/ObsidianaPackagesSection";
import { ObsidianaProductBoxSection } from "@/components/productos/obsidiana-y-tempestad/ObsidianaProductBoxSection";
import type { Decklist } from "@/interfaces";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Obsidiana y Tempestad - Souls In Xtinction TCG",
  description:
    "Obsidiana y Tempestad es una expansión de Souls In Xtinction inspirada en el Mito de los Cinco Soles, con Tezcatlipoca y Quetzalcoatl enfrentados por el dominio del mundo.",
  openGraph: {
    title: "Obsidiana y Tempestad - Souls In Xtinction TCG",
    description:
      "Tezcatlipoca y Quetzalcoatl chocan en una lucha divina por el dominio del mundo en Obsidiana y Tempestad.",
    url: "https://soulsinxtinction.com/productos/obsidiana-y-tempestad",
    siteName: "Obsidiana y Tempestad",
    images: [
      {
        url: "https://soulsinxtinction.com/product-pages/obsidiana-y-tempestad/logo.webp",
        width: 1774,
        height: 1706,
        alt: "Obsidiana y Tempestad Souls In Xtinction TCG",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export default async function Page() {
  const product = await getProductUrl("obsidiana-y-tempestad");
  let decklist: Decklist[] = [];

  if (product) {
    const { mainDeck, sideDeck } = await getDecksByIds(product.deckCards ?? "");
    decklist = [...mainDeck, ...sideDeck];
  }

  return (
    <>
      <h1 className="sr-only">Productos Obsidiana y Tempestad</h1>
      <main className="relative isolate min-h-screen overflow-hidden text-white before:absolute before:inset-0 before:z-0 before:bg-[url('/product-pages/obsidiana-y-tempestad/background.webp')] before:bg-cover before:bg-center before:bg-fixed before:brightness-75 before:contrast-125 before:content-['']">
        <div className="relative z-10">
          <ObsidianaHeroSection />
          <ObsidianaPackagesSection />
          <ObsidianaDevoraSection />
          <ObsidianaProductBoxSection />
          <ObsidianaCollectionSection decklist={decklist} />
        </div>
      </main>
    </>
  );
}
