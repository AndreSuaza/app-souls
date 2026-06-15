import type { Metadata } from "next";
import { HowToPlayGuide } from "@/components/how-to-play/HowToPlayGuide";

export const metadata: Metadata = {
  title: "Aprende a jugar Souls In Xtinction TCG | Guía rápida",
  description:
    "Aprende las reglas básicas de Souls In Xtinction: mazos, inicio de partida, fases del turno, acciones, combate y conjuros.",
  openGraph: {
    title: "Aprende a jugar Souls In Xtinction TCG | Guía rápida",
    description:
      "Conoce paso a paso las reglas esenciales para comenzar a jugar Souls In Xtinction TCG.",
    url: "https://soulsinxtinction.com/como-jugar",
    siteName: "Souls In Xtinction",
    images: [
      {
        url: "https://soulsinxtinction.com/souls-in-xtinction.webp",
        width: 800,
        height: 600,
        alt: "Aprende a jugar Souls In Xtinction TCG",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export default function ComoJugarPage() {
  return <HowToPlayGuide />;
}
