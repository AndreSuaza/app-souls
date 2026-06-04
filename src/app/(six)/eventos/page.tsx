import type { Metadata } from "next";
import { getPublicEventsAction } from "@/actions/events/get-public-events.action";
import { PublicEventsCalendar } from "@/components/events/public/PublicEventsCalendar";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Calendario de eventos | Souls In Xtinction TCG",
  description:
    "Consulta los próximos eventos oficiales de Souls In Xtinction TCG, fechas, sedes y actividades destacadas del circuito.",
  alternates: {
    canonical: "https://soulsinxtinction.com/eventos",
  },
  openGraph: {
    title: "Calendario de eventos | Souls In Xtinction TCG",
    description:
      "Consulta los próximos eventos oficiales de Souls In Xtinction TCG, fechas, sedes y actividades destacadas del circuito.",
    url: "https://soulsinxtinction.com/eventos",
    siteName: "Souls In Xtinction - Eventos",
    images: [
      {
        url: "https://soulsinxtinction.com/souls-in-xtinction.webp",
        width: 800,
        height: 600,
        alt: "Calendario de eventos Souls In Xtinction TCG",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export default async function EventosPage() {
  const events = await getPublicEventsAction();

  return (
    <PublicEventsCalendar
      events={events}
      referenceDate={new Date().toISOString()}
    />
  );
}
