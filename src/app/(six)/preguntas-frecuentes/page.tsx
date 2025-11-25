import { getStorePagination } from "@/actions";
import { PreguntasFrecuentes } from "@/components";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: 'Aprende a Jugar Souls In Xtinction TCG – Guía Completa para Principiantes',
  description: 'Descubre las reglas básicas, mecánicas y estrategias para dominar Souls In Xtinction TCG. Esta guía te enseñará cómo construir tu mazo, entender las cartas y desarrollar tácticas para vencer a tus oponentes.',
  openGraph: {
    title: 'Aprende a Jugar Souls In Xtinction TCG – Guía Completa para Principiantes',
      description: 'Descubre las reglas básicas, mecánicas y estrategias para dominar Souls In Xtinction TCG. Esta guía te enseñará cómo construir tu mazo, entender las cartas y desarrollar tácticas para vencer a tus oponentes.',
      url: 'https://soulsinxtinction.com/como-jugar',
      siteName: 'Aprende a jugar - Souls In Xtinction',
      images: [
          {
          url: 'https://soulsinxtinction.com/souls-in-xtinction.webp',
          width: 800,
          height: 600,
          alt: 'Aprende a jugar Souls In Xtinction TCG',
          }
      ],
      locale: 'en_ES',
      type: 'website',
  },
}

export default async function ComoJuagarPage() {

  return (
    <>
    <PreguntasFrecuentes/>
    </>
  )
}
