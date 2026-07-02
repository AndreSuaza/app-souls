"use client";

import Image from "next/image";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";

const pages = [
  {
    id: "bloque-1",
    title: "Lorem ipsum dolor",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio praesent libero sed cursus ante dapibus diam.",
    renderPosition: "52% 48%",
    cards: [
      "/products/avance-etereo/bloque-1-1.png",
      "/products/avance-etereo/bloque-1-2.png",
      "/products/avance-etereo/bloque-1-3.png",
    ],
  },
  {
    id: "bloque-2",
    title: "Sed cursus ante",
    description:
      "Sed nisi nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum praesent mauris fusce nec tellus.",
    renderPosition: "44% 48%",
    cards: [
      "/products/avance-etereo/bloque-2-1.png",
      "/products/avance-etereo/bloque-2-2.png",
      "/products/avance-etereo/bloque-2-3.png",
    ],
  },
  {
    id: "bloque-3",
    title: "Fusce nec tellus",
    description:
      "Praesent mauris fusce nec tellus sed augue semper porta. Mauris massa vestibulum lacinia arcu eget nulla.",
    renderPosition: "61% 48%",
    cards: [
      "/products/avance-etereo/bloque-3-1.jpg",
      "/products/avance-etereo/bloque-3-2.png",
      "/products/avance-etereo/bloque-3-3.png",
    ],
  },
  {
    id: "bloque-4",
    title: "Vestibulum lacinia",
    description:
      "Class aptent taciti sociosqu ad litora torquent per conubia nostra per inceptos himenaeos curabitur sodales.",
    renderPosition: "70% 48%",
    cards: [
      "/products/avance-etereo/bloque-4-1.png",
      "/products/avance-etereo/bloque-4-2.png",
      "/products/avance-etereo/bloque-4-3.png",
    ],
  },
];

export function AvanceEtereoCardsCarouselSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToIndex = useCallback(
    (nextIndex: number) => {
      const normalizedIndex = (nextIndex + pages.length) % pages.length;

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
    const target = document.getElementById("avance-etereo-collection");
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
    const intervalId = window.setInterval(goToNext, 5000);

    return () => window.clearInterval(intervalId);
  }, [goToNext]);

  return (
    <section className="relative w-full overflow-hidden bg-[#edf8f6] py-14 text-[#081018] md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(123,231,222,0.18),transparent_22%),radial-gradient(circle_at_78%_22%,rgba(200,167,234,0.32),transparent_34%)]" />
      <div className="relative mx-auto grid min-h-[680px] w-full max-w-7xl grid-cols-1 items-start gap-8 px-6 pb-48 lg:grid-cols-2 lg:px-10 lg:pb-56">
        <div className="relative z-20 grid max-w-xl text-center lg:pt-6 lg:text-left">
          {pages.map((page, index) => (
            <div
              key={page.id}
              className={clsx(
                "col-start-1 row-start-1 space-y-5 transition-[opacity,filter,transform] duration-1000 ease-in-out",
                activeIndex === index
                  ? "pointer-events-auto scale-100 opacity-100 blur-0"
                  : "pointer-events-none scale-[0.995] opacity-0 blur-[1px]",
              )}
            >
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#7BE7DE]">
                Avance Etéreo
              </p>
              <h2 className="text-3xl font-black uppercase tracking-wide sm:text-5xl">
                {page.title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                {page.description}
              </p>
              <button
                type="button"
                onClick={scrollToCollection}
                className="inline-flex items-center justify-center rounded-lg bg-[#7BE7DE] px-6 py-3 text-sm font-black uppercase tracking-wide text-[#081018] shadow-lg shadow-[#7BE7DE]/30 transition hover:bg-[#C8A7EA] focus:outline-none focus:ring-2 focus:ring-[#7BE7DE] focus:ring-offset-2"
              >
                Ver más cartas
              </button>
            </div>
          ))}
        </div>

        <div className="relative z-10 min-h-[340px] lg:min-h-[520px]">
          {pages.map((page, index) => (
            <div
              key={page.id}
              className={clsx(
                "absolute inset-x-0 top-0 mx-auto h-[360px] w-full max-w-[620px] overflow-hidden rounded-b-[48%] rounded-t-[18px] transition-[opacity,filter,transform] duration-1000 ease-in-out lg:h-[560px] lg:max-w-[720px]",
                activeIndex === index
                  ? "scale-100 opacity-100 blur-0"
                  : "scale-[1.015] opacity-0 blur-[1px]",
              )}
            >
              <Image
                src="/products/avance-etereo/hero-banner.jpg"
                alt={`Arte destacado ${page.title}`}
                title={`Arte destacado ${page.title}`}
                fill
                sizes="(min-width: 1024px) 50vw, 90vw"
                className="scale-125 object-cover"
                style={{ objectPosition: page.renderPosition }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#edf8f6]" />
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-20 z-30 mx-auto flex w-full max-w-5xl justify-center px-6 lg:bottom-24">
          <div className="relative h-[215px] w-full max-w-[760px] sm:h-[275px] lg:h-[330px]">
            {pages.map((page, pageIndex) => (
              <div
                key={page.id}
                className={clsx(
                  "absolute inset-0 grid grid-cols-3 items-end gap-3 transition-[opacity,filter,transform] duration-1000 ease-in-out sm:gap-6",
                  activeIndex === pageIndex
                    ? "scale-100 opacity-100 blur-0"
                    : "scale-[0.985] opacity-0 blur-[1px]",
                )}
              >
                {page.cards.map((card, cardIndex) => (
                  <div key={card} className="flex justify-center">
                    <Image
                      src={card}
                      alt={`Carta Avance Etéreo ${pageIndex + 1}-${cardIndex + 1}`}
                      title={`Carta Avance Etéreo ${pageIndex + 1}-${cardIndex + 1}`}
                      width={300}
                      height={431}
                      sizes="(min-width: 1024px) 230px, 30vw"
                      className="h-auto w-full max-w-[150px] cursor-crosshair rounded-xl object-cover shadow-2xl sm:max-w-[190px] lg:max-w-[230px]"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-40 flex -translate-x-1/2 items-center justify-center gap-2">
          {pages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              onClick={() => goToIndex(index)}
              aria-label={`Ir al bloque ${index + 1}`}
              className={clsx(
                "h-2.5 w-2.5 rounded-full border transition-colors",
                activeIndex === index
                  ? "border-[#7BE7DE] bg-[#7BE7DE]"
                  : "border-slate-500 bg-slate-700",
              )}
            />
          ))}
        </div>

        <div className="absolute bottom-6 right-6 z-40 flex items-center gap-2 lg:right-10">
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Ver bloque anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#081018] text-white transition hover:bg-[#24464c] focus:outline-none focus:ring-2 focus:ring-[#7BE7DE]"
          >
            <IoChevronBackOutline className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            aria-label="Ver bloque siguiente"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#081018] text-white transition hover:bg-[#24464c] focus:outline-none focus:ring-2 focus:ring-[#7BE7DE]"
          >
            <IoChevronForwardOutline className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
