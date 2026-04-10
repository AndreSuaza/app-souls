import { CataclismoCardStack } from "@/components/productos/cataclismo/CataclismoCardStack";

const showcaseItems = [
  {
    title: "Crimson engines awake",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Integer quis metus nec justo pulvinar luctus.",
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
    title: "Ashes, steel, destiny",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet lacus sed augue commodo mattis.",
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
    title: "The storm never fades",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis egestas auctor sem, ut tincidunt libero luctus a.",
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
    <section className="w-full bg-[#1f0a12]/70 py-16 backdrop-blur-sm md:py-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 text-center lg:px-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-wide text-white sm:text-4xl">
            Heroes carved from crimson
          </h2>
          <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
            faucibus, ipsum in fringilla fermentum, elit elit efficitur elit,
            vitae feugiat elit sem a urna.
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
