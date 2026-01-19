"use client";

import type { Archetype, Card, Keyword, Rarity, Type } from "@/interfaces";
import { useCardDetailStore } from "@/store";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  IoChevronBack,
  IoChevronForward,
  IoCloseOutline,
} from "react-icons/io5";
import { CardDetailStatCard } from "./CardDetailStatCard";
import { CardDetailProductCard } from "./CardDetailProductCard";

interface Props {
  cards: Card[];
  indexList: number;
}

export const CardDetail = ({ cards, indexList }: Props) => {
  const [deckList] = useState(cards);
  const [card, setCard] = useState(deckList[indexList]);
  const [indexCard, setIndexCard] = useState(indexList);
  const [isMounted, setIsMounted] = useState(false);
  const isCardDetailOpen = useCardDetailStore(
    (state) => state.isCardDetailOpen,
  );
  const closeCardDetail = useCardDetailStore((state) => state.closeCardDetail);

  useEffect(() => {
    if (!isCardDetailOpen) return;
    const previousOverflow = document.body.style.overflow;
    // Bloquea el scroll del body mientras el modal esta abierto.
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCardDetailOpen]);

  useEffect(() => {
    // Evita renderizar el portal antes de que exista document.
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const forwardCard = () => {
    if (indexCard < deckList.length - 1) {
      setIndexCard(indexCard + 1);
      setCard(deckList[indexCard + 1]);
    } else {
      setIndexCard(0);
      setCard(deckList[0]);
    }
  };

  const backCard = () => {
    if (indexCard > 0) {
      setIndexCard(indexCard - 1);
      setCard(deckList[indexCard - 1]);
    } else {
      setIndexCard(deckList.length - 1);
      setCard(deckList[deckList.length - 1]);
    }
  };

  const typeText = useMemo(() => {
    if (!card?.types?.length) return "";
    return card.types.map((type: Type) => type.name).join(", ");
  }, [card]);

  const archetypeText = useMemo(() => {
    if (!card?.archetypes?.length) return "";
    return card.archetypes
      .map((archetype: Archetype) => archetype.name)
      .join(", ");
  }, [card]);

  const rarityText = useMemo(() => {
    if (!card?.rarities?.length) return "";
    return card.rarities.map((rarity: Rarity) => rarity.name).join(", ");
  }, [card]);

  const keywordsText = useMemo(() => {
    if (!card?.keywords?.length) return "Sin palabras clave";
    const keywordNames = card.keywords
      .map((keyword: Keyword) => keyword.name?.trim())
      .filter((name): name is string => !!name);
    if (keywordNames.length === 0) return "Sin palabras clave";
    return keywordNames.join(", ");
  }, [card]);

  const stats = useMemo(() => {
    const items = [
      { label: "Tipo", value: typeText },
      { label: "Coste", value: card.cost },
      { label: "Fuerza", value: card.force },
      { label: "Defensa", value: card.defense },
      { label: "Arquetipo", value: archetypeText },
      { label: "Rareza", value: rarityText },
    ];

    // Evita mostrar etiquetas vacias para atributos que no existan en la carta.
    return items
      .map((item) => {
        if (item.value === null || item.value === undefined) {
          return { label: item.label, value: "" };
        }
        if (typeof item.value === "number") {
          return { label: item.label, value: `${item.value}` };
        }
        return { label: item.label, value: item.value.toString().trim() };
      })
      .filter((item) => item.value.length > 0);
  }, [typeText, archetypeText, rarityText, card]);

  if (!isCardDetailOpen || !isMounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm fade-in"
        onClick={closeCardDetail}
      />

      <div className="relative z-10 h-full w-full overflow-hidden border-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-2xl sm:h-auto sm:max-h-[80vh] sm:w-full sm:max-w-6xl sm:rounded-lg sm:mx-4 sm:my-6 dark:border-2 dark:border-tournament-dark-border dark:from-slate-950 dark:via-tournament-dark-surface dark:to-tournament-dark-bg lg:w-3/5 lg:max-w-none">
        <div className="flex items-center justify-between border-b border-purple-600 bg-slate-100/90 px-6 py-4 dark:border-tournament-dark-border dark:bg-slate-950/70">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl dark:text-slate-100">
            {card.name}
          </h1>

          <button
            type="button"
            aria-label="Cerrar detalle de carta"
            onClick={closeCardDetail}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-slate-600 transition hover:border-purple-400 hover:text-purple-600 dark:border dark:border-tournament-dark-border dark:bg-slate-950/80 dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
          >
            <IoCloseOutline className="h-6 w-6" />
          </button>
        </div>

        <button
          type="button"
          aria-label="Carta anterior"
          onClick={backCard}
          className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg border border-purple-600 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/90 dark:text-white dark:hover:bg-tournament-dark-muted-hover"
        >
          <IoChevronBack className="h-6 w-6" />
        </button>
        <button
          type="button"
          aria-label="Carta siguiente"
          onClick={forwardCard}
          className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg border border-purple-600 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/90 dark:text-white dark:hover:bg-tournament-dark-muted-hover"
        >
          <IoChevronForward className="h-6 w-6" />
        </button>

        <div className="grid h-[calc(100vh-72px)] grid-cols-1 overflow-y-auto px-4 sm:h-auto sm:max-h-[calc(80vh-72px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="relative flex flex-col items-center gap-5 border-b border-purple-600 py-6 lg:border-b-0 dark:border-tournament-dark-border">
            <div className="relative w-full max-w-[380px]">
              <div className="overflow-hidden rounded-lg bg-slate-950/80 shadow-lg shadow-gray-300/60 dark:bg-tournament-dark-muted-strong/40 dark:shadow-2xl dark:shadow-white/10">
                <Image
                  src={`/cards/${card.code}-${card.idd}.webp`}
                  alt={card.name}
                  className="block w-full object-cover"
                  width={500}
                  height={718}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 px-4 py-6 sm:px-5 lg:px-6 lg:py-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {stats.map((item) => (
                <CardDetailStatCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Palabras clave
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {keywordsText}
              </p>
            </div>

            <div className="rounded-lg border border-purple-600 bg-white p-5 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80 dark:shadow-inner">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Efecto de habilidad
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {card.effect || "Sin efecto"}
              </p>
            </div>

            <div className="space-y-4">
              <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Productos donde puedes encontrar esta carta
              </p>
              <CardDetailProductCard product={card.product} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
