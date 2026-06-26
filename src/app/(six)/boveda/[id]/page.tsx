import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getBovedaCardDetailAction } from "@/actions/cards/get-boveda-card-detail.action";
import { BovedaCardDetail } from "@/components/boveda/BovedaCardDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-static";
export const revalidate = 86400;

const getBovedaDetail = cache((slug: string) =>
  getBovedaCardDetailAction({ slug }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const detail = await getBovedaDetail(id);

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
  const canonical = `https://soulsinxtinction.com/boveda/${detail.slug}`;

  return {
    title: `${detail.name} | Bóveda`,
    description,
    keywords,
    robots: {
      index: false,
      follow: true,
    },
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

export default async function Page({ params }: Props) {
  const { id } = await params;
  const detail = await getBovedaDetail(id);
  if (!detail) {
    notFound();
  }

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-tournament-dark-bg dark:text-white space-y-4">
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 py-10">
        <h1 className="sr-only">{detail.name} en la bóveda</h1>
        <BovedaCardDetail card={detail} />
      </section>
    </div>
  );
}
