"use client";

import clsx from "clsx";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

const packages = [
  {
    id: "quetzalcoatl",
    eyebrow: "Paquete 1",
    title: "Quetzalcóatl, Dios de la Tempestad",
    description:
      "Cada adorador ofrece una parte de su esencia a Quetzalcóatl, alimentando el poder ancestral que duerme en su interior. Con cada instante que pasa, su fuerza crece, su presencia se vuelve más imponente y su poder más difícil de contener.",
    cards: [
      "/product-pages/obsidiana-y-tempestad/paquete-1-1.webp",
      "/product-pages/obsidiana-y-tempestad/paquete-1-2.webp",
      "/product-pages/obsidiana-y-tempestad/paquete-1-3.webp",
    ],
  },
  {
    id: "tezcatlipoca",
    eyebrow: "Paquete 2",
    title: "Tezcatlipoca, Corazón de Obsidiana",
    description:
      "Cada aliado sacrificado alimenta el poder de Tezcatlipoca, otorgándole nuevas habilidades y volviéndolo cada vez más peligroso. Úsalos con sabiduría y conviértelo en el dios más temido del universo.",
    cards: [
      "/product-pages/obsidiana-y-tempestad/paquete-2-1.webp",
      "/product-pages/obsidiana-y-tempestad/paquete-2-2.webp",
      "/product-pages/obsidiana-y-tempestad/paquete-2-3.webp",
    ],
  },
];

export function ObsidianaPackagesSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToIndex = useCallback(
    (nextIndex: number) => {
      const normalizedIndex = (nextIndex + packages.length) % packages.length;
      if (normalizedIndex === activeIndex) return;
      setActiveIndex(normalizedIndex);
    },
    [activeIndex],
  );

  const goToPrevious = useCallback(() => {
    goToIndex(activeIndex - 1);
  }, [activeIndex, goToIndex]);

  const goToNext = useCallback(() => {
    goToIndex(activeIndex + 1);
  }, [activeIndex, goToIndex]);

  const scrollToCollection = () => {
    const target = document.getElementById("obsidiana-y-tempestad-collection");
    if (!target) return;

    const startY = window.scrollY;
    const targetY = target.getBoundingClientRect().top + startY - 88;
    const distance = targetY - startY;
    const duration = 950;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startY + distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  useEffect(() => {
    const intervalId = window.setInterval(goToNext, 6000);
    return () => window.clearInterval(intervalId);
  }, [goToNext]);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#061f2a] via-[#092d3d] to-[#0b2867] py-14 md:py-20">
      <div className="relative mx-auto grid min-h-[660px] w-full max-w-7xl grid-cols-1 items-start gap-8 px-6 pb-44 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:pb-52">
        <div className="relative z-20 grid max-w-xl text-center lg:pt-8 lg:text-left">
          {packages.map((item, index) => (
            <div
              key={item.id}
              className={clsx(
                "col-start-1 row-start-1 space-y-5 transition-[opacity,filter,transform] duration-1000 ease-in-out",
                activeIndex === index
                  ? "pointer-events-auto scale-100 opacity-100 blur-0"
                  : "pointer-events-none scale-[0.995] opacity-0 blur-[1px]",
              )}
            >
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#65eadc]">
                {item.eyebrow}
              </p>
              <h2 className="text-3xl font-black uppercase tracking-wide sm:text-5xl">
                {item.title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-100 sm:text-base">
                {item.description}
              </p>
              <button
                type="button"
                onClick={scrollToCollection}
                className="inline-flex items-center justify-center rounded-lg bg-[#65eadc] px-6 py-3 text-sm font-black uppercase tracking-wide text-[#061f2a] shadow-lg shadow-[#65eadc]/25 transition hover:bg-[#2452d7] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#65eadc] focus:ring-offset-2 focus:ring-offset-[#061f2a]"
              >
                Ver más cartas
              </button>
            </div>
          ))}
        </div>

        <div className="relative z-10 min-h-[420px] lg:min-h-[520px]">
          {packages.map((item, packageIndex) => (
            <div
              key={item.id}
              className={clsx(
                "absolute inset-0 grid grid-cols-3 items-center gap-3 transition-[opacity,filter,transform] duration-1000 ease-in-out sm:gap-6",
                activeIndex === packageIndex
                  ? "scale-100 opacity-100 blur-0"
                  : "scale-[0.985] opacity-0 blur-[1px]",
              )}
            >
              {item.cards.map((card, cardIndex) => (
                <div key={card} className="flex justify-center">
                  <Image
                    src={card}
                    alt={`Carta ${item.title} ${cardIndex + 1}`}
                    title={`Carta ${item.title} ${cardIndex + 1}`}
                    width={300}
                    height={431}
                    sizes="(min-width: 1024px) 230px, 30vw"
                    className="h-auto w-full max-w-[150px] cursor-crosshair rounded-xl object-cover shadow-2xl shadow-black/40 sm:max-w-[190px] lg:max-w-[230px]"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="absolute bottom-8 left-1/2 z-40 flex -translate-x-1/2 items-center justify-center gap-2">
          {packages.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goToIndex(index)}
              aria-label={`Ir al ${item.eyebrow}`}
              className={clsx(
                "h-2.5 w-2.5 rounded-full border transition-colors",
                activeIndex === index
                  ? "border-[#65eadc] bg-[#65eadc]"
                  : "border-slate-500 bg-slate-700",
              )}
            />
          ))}
        </div>

        <div className="absolute bottom-6 right-6 z-40 flex items-center gap-2 lg:right-10">
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Ver paquete anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#061f2a] text-white transition hover:bg-[#2452d7] focus:outline-none focus:ring-2 focus:ring-[#65eadc]"
          >
            <IoChevronBackOutline className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            aria-label="Ver paquete siguiente"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#061f2a] text-white transition hover:bg-[#2452d7] focus:outline-none focus:ring-2 focus:ring-[#65eadc]"
          >
            <IoChevronForwardOutline className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
