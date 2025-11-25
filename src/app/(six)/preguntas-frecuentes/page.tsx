import { PreguntasFrecuentes } from "@/components";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: 'Centro Oficial de Preguntas Frecuentes Souls In Xtinction TCG',
  description: 'Encuentra aquí las respuestas oficiales a las dudas más comunes sobre reglas, mecánicas y efectos dentro de Souls In Xtinction. Una guía rápida y clara para que cada duelo se juegue de forma correcta y sin confusiones.',
  openGraph: {
    title: 'Centro Oficial de Preguntas Frecuentes Souls In Xtinction TCG',
      description: 'Encuentra aquí las respuestas oficiales a las dudas más comunes sobre reglas, mecánicas y efectos dentro de Souls In Xtinction. Una guía rápida y clara para que cada duelo se juegue de forma correcta y sin confusiones.',
      url: 'https://soulsinxtinction.com/como-jugar',
      siteName: 'Preguntas Frecuentes - Souls In Xtinction',
      images: [
          {
          url: 'https://soulsinxtinction.com/souls-in-xtinction.webp',
          width: 800,
          height: 600,
          alt: 'Preguntas Frecuentes Souls In Xtinction TCG',
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
