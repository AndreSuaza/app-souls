import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicEventDetailAction } from "@/actions/events/get-public-event-detail.action";
import { PublicEventDetailView } from "@/components/events/public/PublicEventDetail";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getPublicEventDetailAction(slug);

  if (!detail) {
    return {
      title: "Evento no encontrado",
      description: "El evento solicitado no esta disponible.",
    };
  }

  const { event } = detail;

  return {
    title: event.title,
    description: event.shortSummary,
    openGraph: {
      title: event.title,
      description: event.shortSummary,
      url: `https://soulsinxtinction.com/eventos/${event.slug}`,
      images: [
        {
          url: event.cardImage,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
      type: "article",
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const detail = await getPublicEventDetailAction(slug);

  if (!detail) {
    notFound();
  }

  return (
    <PublicEventDetailView
      event={detail.event}
      recommended={detail.recommended}
    />
  );
}
