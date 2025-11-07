import { HomeNational } from "@/components";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: 'Torneo Nacional | Souls In Xtinction TCG',
  description: 'El Nacional de Souls In Xtinction reúne a los mejores jugadores del país en una batalla épica por la gloria. Estrategia, habilidad y pasión se enfrentan para definir al verdadero maestro de las almas.',
  openGraph: {
    title: 'Torneo Nacional | Souls In Xtinction TCG',
    description: 'El Nacional de Souls In Xtinction reúne a los mejores jugadores del país en una batalla épica por la gloria. Estrategia, habilidad y pasión se enfrentan para definir al verdadero maestro de las almas.',
      url: 'https://soulsinxtinction.com/nacional',
      siteName: 'Torneo Nacional | Souls In Xtinction TCG',
      images: [
          {
          url: 'https://soulsinxtinction.com/national/torneo-nacional.webp',
          width: 800,
          height: 600,
          alt: 'Nacional Souls In Xtinction TCG',
          }
      ],
      locale: 'en_ES',
      type: 'website',
  },
}

export default function TorneoNacional() {
 return (
    <HomeNational/>
  );
}
