import { getDecksByIds, getProductUrl } from "@/actions";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import { ProductDeckCollection } from "@/components/productos/complete-collection/ProductDeckCollection";
import "../style.css";
import { Metadata } from "next";

export const revalidate = 3600;


export const metadata: Metadata = {
  title: "Memorias Olvidadas | Souls In Xtinction TCG",
  description:
    "Memorias Olvidadas es una expansion de Souls In Xtinction TCG que abre el pasado prohibido del alma. Vampiros e Isiras chocan en una historia de sombras y esencia espiritual, con cartas estrategicas para coleccionistas y jugadores.",
  keywords: [
    "Souls In Xtinction",
    "Memorias Olvidadas",
    "expansion",
    "TCG",
    "cartas",
    "coleccion",
  ],
  alternates: {
    canonical: "https://soulsinxtinction.com/productos/memorias-olvidadas",
  },
  openGraph: {
    title: "Memorias Olvidadas | Souls In Xtinction TCG",
    description:
      "Memorias Olvidadas es una expansion de Souls In Xtinction TCG que abre el pasado prohibido del alma. Vampiros e Isiras chocan en una historia de sombras y esencia espiritual, con cartas estrategicas para coleccionistas y jugadores.",
    url: "https://soulsinxtinction.com/productos/memorias-olvidadas",
    siteName: "Memorias Olvidadas",
    images: [
      {
        url: "https://soulsinxtinction.com/products/MO.webp",
        width: 500,
        height: 500,
        alt: "Memorias Olvidadas Souls In Xtinction TCG",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export default async function getProductBySlug() {
  const product = await getProductUrl("memorias-olvidadas");

  if (!product) {
    notFound();
  }

  const { mainDeck, sideDeck } = await getDecksByIds(product.deckCards ?? "");
  const decklist = [...mainDeck, ...sideDeck];

  return (
    <>
      <section
        className={`bg-[url(/products/MOG.webp)] bg-cover bg-fixed w-full bg-left-top grid grid-cols-1 lg:grid-cols-2`}
      >
        <div className="flex flex-col items-center justify-center w-full p-12">
          <Image
            src={`/products/${product.code}S.webp`}
            alt="Memorias Olvidadas Expansion Souls"
            title="Memorias Olvidadas Expansion Souls"
            className="my-auto"
            width={400}
            height={160}
          />
        </div>
        <div className="bg-black bg-opacity-80 text-stone-300 flex justify-end py-10">
          <div className="w-2/3 m-auto markdawon">
            <h1 className="text-5xl font-bold text-center mb-10 md:my-10 lg:mx-40">
              {product.name}
            </h1>

            <MDXRemote source={product.description} />
          </div>
        </div>
      </section>
      <div className="bg-gray-600 flex flex-col items-center"></div>
      <div className="px-2 lg:px-20 pt-6 bg-slate-950 pb-10">
        <h2 className="text-4xl font-bold uppercase text-white mb-10">
          La colección completa
        </h2>
        <ProductDeckCollection decklist={decklist} />
      </div>
    </>
  );
}


