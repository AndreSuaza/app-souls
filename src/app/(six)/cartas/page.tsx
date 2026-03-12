import { getPaginatedCards, getPropertiesCards } from "@/actions";
import { CardFinder } from "@/components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cartas Souls In Xtinction TCG | Catalogo",
  description:
    "Explora el catalogo de cartas de Souls In Xtinction TCG. Filtra por arquetipos, rarezas, costos y tipos, y descubre cada carta con sus detalles para construir tu mazo ideal.",
  keywords: [
    "Souls In Xtinction",
    "cartas",
    "catalogo de cartas",
    "TCG",
    "arquetipos",
    "rareza",
    "mazos",
  ],
  alternates: {
    canonical: "https://soulsinxtinction.com/cartas",
  },
  openGraph: {
    title: "Cartas Souls In Xtinction TCG | Catalogo",
    description:
      "Explora el catalogo de cartas de Souls In Xtinction TCG. Filtra por arquetipos, rarezas, costos y tipos, y descubre cada carta con sus detalles para construir tu mazo ideal.",
    url: "https://soulsinxtinction.com/cartas",
    siteName: "Cartas - Souls In Xtinction TCG",
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

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    page?: string;
    text?: string;
    products?: string;
    types?: string;
    archetypes?: string;
    keywords?: string;
    costs?: string;
    forces?: string;
    defenses?: string;
    raritys?: string;
    rarities?: string;
    limit?: string;
  }>;
}

export default async function Cards({ searchParams }: Props) {
  const {
    text,
    products,
    types,
    archetypes,
    keywords,
    costs,
    forces,
    defenses,
    page,
    rarities,
    limit,
  } = await searchParams;
  const page2 = page ? parseInt(page) : 1;

  const propertiesCards = await getPropertiesCards();
  const { cards, totalPage, totalCount, perPage } = await getPaginatedCards({
    page: page2,
    text,
    products,
    types,
    archetypes,
    keywords,
    costs,
    forces,
    defenses,
    rarities,
    limit,
  });

  return (
    <>
      <h1 className="sr-only">Cartas de Souls In Xtinction TCG</h1>
      <CardFinder
        cards={cards}
        propertiesCards={propertiesCards}
        totalPage={totalPage}
        totalCards={totalCount}
        perPage={perPage}
        useAdvancedFilters
        disableGridInitialAnimation
        disableGridAnimations
      />
    </>
  );
}
