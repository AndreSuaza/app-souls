import Image from "next/image";
import { TiltCard } from "@/components/ui/tilt/TiltCard";

const cards = [
  {
    id: "cat-045",
    src: "/cards/CAT-045-6334.webp",
    alt: "Carta Cataclismo 045",
  },
  {
    id: "cat-056",
    src: "/cards/CAT-056-1306.webp",
    alt: "Carta Cataclismo 056",
  },
  {
    id: "cat-057",
    src: "/cards/CAT-057-8077.webp",
    alt: "Carta Cataclismo 057",
  },
  {
    id: "cat-048",
    src: "/cards/CAT-048-2536.webp",
    alt: "Carta Cataclismo 048",
  },
];

export function CataclismoQuadCardsSection() {
  return (
    <section className="w-full bg-[#1f0a12]/70 py-16 backdrop-blur-sm md:py-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 text-center lg:px-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-wide text-white sm:text-4xl">
            Pikingos: la furia alza vuelo
          </h2>
          <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
            La raza de palomas vikingas regresa con un refuerzo explosivo. Más agresivos, más rápidos y con nuevas herramientas, los Pikingos ahora dominan el campo con presión constante y generación de recursos que potencia su estilo ofensivo.
          </p>
        </div>

        <div className="grid w-full max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
          {cards.map((card) => (
            <div key={card.id} className="flex justify-center">
              <TiltCard className="w-full max-w-[220px]">
                <Image
                  src={card.src}
                  alt={card.alt}
                  title={card.alt}
                  width={320}
                  height={480}
                  className="h-auto w-full rounded-2xl object-cover shadow-2xl"
                />
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
