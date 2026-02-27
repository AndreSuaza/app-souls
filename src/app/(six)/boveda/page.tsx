import { getPaginatedPricesCards, getPropertiesCards } from "@/actions";
import { CardFinderPrices, Pagination } from "@/components";
import { PaginationStats } from "@/components/ui/pagination/PaginationStats";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

interface Props {
  searchParams: Promise<{
    page?: string;
    products?: string;
    rarities?: string;
    text?: string;
    order?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Boveda - Referencia precios de las cartas de souls in xtiction",
  description:
    "Consulta una referencia de los precios actualizados de las cartas coleccionables de Souls In Xtinction TCG en un solo lugar. Encuentra el valor de cada carta, desde las más comunes hasta las más raras y codiciadas.",
  openGraph: {
    title: "Boveda - Referencia precios de las cartas de souls in xtiction",
    description:
      "Consulta una referencia de los precios actualizados de las cartas coleccionables de Souls In Xtinction TCG en un solo lugar. Encuentra el valor de cada carta, desde las más comunes hasta las más raras y codiciadas.",
    url: "https://soulsinxtinction.com/boveda",
    siteName: "Boveda - Souls In Xtinction",
    images: [
      {
        url: "https://soulsinxtinction.com/boveda.webp",
        width: 800,
        height: 600,
        alt: "Boveda Souls In Xtinction TCG",
      },
    ],
    locale: "en_ES",
    type: "website",
  },
};

export default async function BovedaPage({ searchParams }: Props) {
  const { products, page, rarities, text, order } = await searchParams;
  const page2 = page ? parseInt(page) : 1;

  const propertiesCards = await getPropertiesCards();
  const { cards, totalPage, totalCount, perPage, currentPage } =
    await getPaginatedPricesCards({
      page: page2,
      products,
      rarities,
      text,
      order,
    });

  const resolvedTotal = totalCount ?? cards.length;
  const resolvedPerPage = perPage ?? 24;
  const resolvedPage = currentPage ?? page2;
  const start =
    resolvedTotal === 0 ? 0 : (resolvedPage - 1) * resolvedPerPage + 1;
  const end = Math.min(resolvedPage * resolvedPerPage, resolvedTotal);
  const statsRangeText = `${start}-${end} de ${resolvedTotal}`;
  const priceFormatter = new Intl.NumberFormat("es-CO");

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-tournament-dark-bg dark:text-white space-y-4 pb-10">
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 pt-6">
        <CardFinderPrices propertiesCards={propertiesCards} />
      </div>

      <Pagination totalPages={totalPage}>
        <div className="px-4 sm:px-6 md:px-10 lg:px-16">
          <div className="flex items-center justify-end pb-3">
            <PaginationStats rangeText={statsRangeText} entityLabel="cartas" />
          </div>

          <ul className="grid gap-4 pb-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map((card) => (
              <li key={card.id}>
                <Link
                  href={`/boveda/${card.id}`}
                  className="grid grid-cols-[140px_1fr] sm:grid-cols-[160px_1fr] gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-purple-300 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:hover:border-purple-400/40"
                >
                  <Image
                    src={`/cards/${card.code}-${card.idd}.webp`}
                    alt={card.name}
                    className="h-full w-full object-cover rounded-lg"
                    width={500}
                    height={718}
                  />
                  <div className="flex flex-col gap-2">
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2">
                      {card.name}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {card.product.name}
                    </span>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {card.code}-{card.idd}
                    </p>
                    <div className="mt-auto">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Precio
                      </p>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-300">
                        {card.price != null
                          ? `$${priceFormatter.format(card.price)}`
                          : "Sin precio"}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Pagination>
    </div>
  );
}
