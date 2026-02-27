"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IoChevronDownOutline } from "react-icons/io5";
import { CardDetailStatCard } from "@/components/cartas/card-detail/CardDetailStatCard";
import { CardDetailProductCard } from "@/components/cartas/card-detail/CardDetailProductCard";
import { BovedaPriceCard } from "./BovedaPriceCard";

interface DetailCard {
  id: string;
  idd: string;
  code: string;
  name: string;
  cost: number;
  force: string;
  defense: string;
  limit: string;
  effect: string;
  price: number | null;
  types: { name: string }[];
  archetypes: { name: string }[];
  rarities: { name: string }[];
  keywords: { name: string }[];
  product: {
    name: string;
    code: string;
    show: boolean;
    url: string;
  };
  relatedProducts: {
    name: string;
    code: string;
    show: boolean;
    url: string;
  }[];
}

interface Props {
  card: DetailCard;
}

export function BovedaCardDetail({ card }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const typeText = card.types.map((type) => type.name).join(", ");
  const archetypeText = card.archetypes.map((arch) => arch.name).join(", ");
  const rarityText = card.rarities.map((rarity) => rarity.name).join(", ");
  const keywordsText = card.keywords
    .map((keyword) => keyword.name?.trim())
    .filter((name): name is string => Boolean(name))
    .join(", ");

  const stats = [
    { label: "Tipo", value: typeText },
    { label: "Coste", value: `${card.cost}` },
    { label: "Fuerza", value: card.force },
    { label: "Defensa", value: card.defense },
    { label: "Arquetipo", value: archetypeText },
    { label: "Rareza", value: rarityText },
  ].filter((item) => item.value.length > 0);

  const priceFormatter = new Intl.NumberFormat("es-CO");
  const priceText =
    card.price != null ? `$${priceFormatter.format(card.price)}` : "Sin precio";

  useEffect(() => {
    const measureOverflow = () => {
      if (!contentRef.current) return;
      if (expanded) return;
      // Solo habilitamos "Mostrar mas" cuando el contenido supera la altura visual de la carta.
      if (window.innerWidth < 1024) {
        setCanExpand(false);
        return;
      }

      const contentHeight = contentRef.current.scrollHeight;
      const visibleHeight = contentRef.current.clientHeight;
      const shouldExpand = contentHeight > visibleHeight + 4;
      setCanExpand(shouldExpand);

      if (!shouldExpand && expanded) {
        setExpanded(false);
      }
    };

    const raf = requestAnimationFrame(measureOverflow);
    const handleResize = () => measureOverflow();
    window.addEventListener("resize", handleResize);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measureOverflow)
        : null;

    if (observer && contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  }, [card.id, expanded]);

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white md:hidden">
        {card.name}
      </h1>

      <div className="flex justify-center lg:h-[560px]">
        <div className="h-full w-full max-w-[380px] md:max-w-none overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
          <Image
            src={`/cards/${card.code}-${card.idd}.webp`}
            alt={card.name}
            width={500}
            height={718}
            className="h-full w-full object-fill"
          />
        </div>
      </div>

      <div
        className={`space-y-6 ${
          expanded
            ? ""
            : "lg:grid lg:h-[560px] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-6 lg:space-y-0"
        }`}
      >
        <h1 className="hidden text-3xl font-extrabold text-slate-900 dark:text-white md:block">
          {card.name}
        </h1>

        <div className="grid gap-6 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="relative w-full lg:h-full lg:min-h-0">
            <div
              ref={contentRef}
              className={`space-y-6 lg:overflow-hidden ${
                expanded
                  ? "lg:max-h-[4000px] lg:overflow-visible lg:transition-[max-height] lg:duration-300 lg:ease-out"
                  : "lg:max-h-full lg:transition-none"
              }`}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {stats.map((item) => (
                  <CardDetailStatCard
                    key={item.label}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>

              {keywordsText && (
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Palabras clave
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    {keywordsText}
                  </p>
                </div>
              )}

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Efecto de habilidad
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {card.effect || "Sin efecto"}
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Productos donde puedes encontrar esta carta
                </p>
                <div className="space-y-3">
                  {card.relatedProducts.map((product) => (
                    <CardDetailProductCard
                      key={product.code}
                      product={product}
                    />
                  ))}
                </div>
              </div>
            </div>

            {!expanded && canExpand && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden w-full lg:flex flex-col items-center">
                <div className="h-24 w-full bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent dark:from-tournament-dark-bg/95 dark:via-tournament-dark-bg/80" />
                <div className="pointer-events-auto -mt-10 flex w-full justify-center pb-2">
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-300 dark:hover:text-purple-200"
                  >
                    Mostrar más
                    <IoChevronDownOutline className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {expanded && canExpand && (
              <div className="hidden lg:flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-300 dark:hover:text-purple-200"
                >
                  Mostrar menos
                  <IoChevronDownOutline className="h-4 w-4 rotate-180" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <BovedaPriceCard
              priceLabel="Precio actual"
              priceValue={priceText}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
