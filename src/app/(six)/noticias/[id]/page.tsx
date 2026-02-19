import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicNewsDetailAction } from "@/actions";
import { PublicNewsDetailView } from "@/components/news/public/PublicNewsDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const detail = await getPublicNewsDetailAction(id);

  if (!detail) {
    return {
      title: "Noticia no encontrada",
      description: "La noticia solicitada no está disponible.",
    };
  }

  const { news } = detail;
  const imageUrl = `https://soulsinxtinction.com/news/${news.featuredImage}`;

  return {
    title: news.title,
    description: news.shortSummary,
    openGraph: {
      title: news.title,
      description: news.shortSummary,
      url: `https://soulsinxtinction.com/noticias/${news.id}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: news.title,
        },
      ],
      type: "article",
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const detail = await getPublicNewsDetailAction(id);

  if (!detail) {
    notFound();
  }

  return (
    <PublicNewsDetailView news={detail.news} recommended={detail.recommended} />
  );
}
