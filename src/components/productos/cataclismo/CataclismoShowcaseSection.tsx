import { CataclismoCardStack } from "@/components/productos/cataclismo/CataclismoCardStack";

const showcaseItems = [
  {
    title: "Poder descomunal",
    description:
      "Cada Kaiju representa una amenaza real. Sus habilidades están diseñadas para impactar directamente el estado de la partida, obligando a tu oponente a adaptarse o sucumbir.",
    cards: [
      {
        id: "cat-026",
        src: "/cards/CAT-026-7266.webp",
        alt: "Carta Cataclismo 026",
      },
      {
        id: "cat-027",
        src: "/cards/CAT-027-8418.webp",
        alt: "Carta Cataclismo 027",
      },
      {
        id: "cat-028",
        src: "/cards/CAT-028-8745.webp",
        alt: "Carta Cataclismo 028",
      },
    ],
  },
  {
    title: "Versatilidad estratégica",
    description:
      "Más allá de su fuerza bruta, los Kaijus ofrecen múltiples formas de juego gracias a su interacción con los entes, permitiendo construir estrategias únicas y dinámicas.",
    cards: [
      {
        id: "cat-029",
        src: "/cards/CAT-029-4685.webp",
        alt: "Carta Cataclismo 029",
      },
      {
        id: "cat-030",
        src: "/cards/CAT-030-5757.webp",
        alt: "Carta Cataclismo 030",
      },
      {
        id: "cat-034",
        src: "/cards/CAT-034-1158.webp",
        alt: "Carta Cataclismo 034",
      },
    ],
  },
  {
    title: "Arte monumental",
    description:
      "Cada Kaiju está acompañado de ilustraciones épicas y detalladas que transmiten su escala y presencia, convirtiéndolos en piezas centrales tanto en juego como en colección.",
    cards: [
      {
        id: "cat-038",
        src: "/cards/CAT-038-6314.webp",
        alt: "Carta Cataclismo 038",
      },
      {
        id: "cat-039",
        src: "/cards/CAT-039-6756.webp",
        alt: "Carta Cataclismo 039",
      },
      {
        id: "cat-058",
        src: "/cards/CAT-058-6391.webp",
        alt: "Carta Cataclismo 058",
      },
    ],
  },
];

export function CataclismoShowcaseSection() {
  return (
    <section className="w-full bg-[#120816] py-16 md:py-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 text-center lg:px-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-wide text-white sm:text-4xl">
            Kaijus: colosos que dominan el campo
          </h2>
          <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
            Las criaturas más imponentes jamás vistas llegan al juego. Los Kaijus son entidades colosales que interactúan con los entes, desatando efectos devastadores y cambiando el ritmo de la partida desde el momento en que entran en juego.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-3">
          {showcaseItems.map((item) => (
            <div key={item.title} className="flex flex-col items-center">
              <CataclismoCardStack cards={item.cards} />
              <h3 className="mt-8 text-lg font-black uppercase tracking-wide text-white">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
