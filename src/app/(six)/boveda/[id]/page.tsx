import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getBovedaCardDetailAction,
  getBovedaProductCardsAction,
} from "@/actions";
import { BovedaCardDetail, BovedaProductCardsTable } from "@/components";
import { Pagination } from "@/components/ui/pagination/pagination";
import { PaginationStats } from "@/components/ui/pagination/PaginationStats";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export const dynamic = "force-dynamic";

const formatStatsRange = (page: number, perPage: number, total: number) => {
  if (total <= 0) return "0-0 de 0";
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  return `${start}-${end} de ${total}`;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const detail = await getBovedaCardDetailAction({ cardId: id });

  if (!detail) {
    return {
      title: "Carta no encontrada",
      description: "No encontramos la carta solicitada en la bóveda.",
    };
  }

  const description = `Consulta el precio actual, rareza, tipo y producto asociado de ${detail.name} en la Boveda de Souls In Xtinction TCG. Accede a detalles, compara valores y descubre otras cartas del mismo producto.`;
  const keywords = [
    "Boveda",
    "Souls In Xtinction",
    "precio de cartas",
    "cartas",
    detail.name,
    detail.code,
  ];
  const canonical = `https://soulsinxtinction.com/boveda/${detail.id}`;

  return {
    title: `${detail.name} | Bóveda`,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${detail.name} | Bóveda`,
      description,
      url: canonical,
      siteName: "Boveda - Souls In Xtinction",
      images: [
        {
          url: `https://soulsinxtinction.com/cards/${detail.code}-${detail.idd}.webp`,
          width: 800,
          height: 600,
          alt: detail.name,
        },
      ],
      locale: "es_ES",
      type: "website",
    },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const detail = await getBovedaCardDetailAction({ cardId: id });
  if (!detail) {
    notFound();
  }

  const { page } = await searchParams;
  const pageNumber = page ? Number(page) : 1;

  const productCards = await getBovedaProductCardsAction({
    cardId: id,
    page: isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber,
  });

  if (!productCards.product) {
    notFound();
  }

  const statsRangeText = formatStatsRange(
    productCards.currentPage,
    productCards.perPage,
    productCards.totalCount,
  );

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-tournament-dark-bg dark:text-white space-y-4">
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 py-10">
        <h1 className="sr-only">{detail.name} en la bóveda</h1>
        <BovedaCardDetail card={detail} />
      </section>

      <section className="px-4 sm:px-6 md:px-10 lg:px-16 pb-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Cartas en {productCards.product.name}
            </h2>
          </div>
          <PaginationStats rangeText={statsRangeText} entityLabel="cartas" />
        </div>

        <div className="mt-6">
          <Pagination totalPages={productCards.totalPage}>
            <BovedaProductCardsTable cards={productCards.cards} />
          </Pagination>
        </div>
      </section>
    </div>
  );
}
