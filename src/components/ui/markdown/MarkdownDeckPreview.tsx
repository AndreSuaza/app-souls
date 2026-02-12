"use client";

import { useEffect, useMemo, useState } from "react";
import { getDecksByIds } from "@/actions";
import type { Decklist } from "@/interfaces";
import { ShowDeck } from "@/components/cartas/deck-creator/ShowDeck";

type Props = {
  decklist: string;
};

const noopOpenDetail = () => {};

export const MarkdownDeckPreview = ({ decklist }: Props) => {
  const [mainDeckRaw, setMainDeckRaw] = useState<Decklist[]>([]);
  const [sideDeck, setSideDeck] = useState<Decklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadDeck = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        // Convierte el decklist codificado para reutilizar getDecksByIds.
        const decoded = decklist.trim().replaceAll("%2C", ",");
        const { mainDeck, sideDeck: side } = await getDecksByIds(decoded);

        if (!isActive) return;

        setMainDeckRaw(mainDeck);
        setSideDeck(side);
      } catch (error) {
        console.error("[markdown-deck-preview]", error);
        if (!isActive) return;
        setHasError(true);
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    };

    void loadDeck();

    return () => {
      isActive = false;
    };
  }, [decklist]);

  const { mainDeck, limboDeck } = useMemo(() => {
    const main = mainDeckRaw.filter(
      (deck) => !deck.card.types.some((type) => type.name === "Limbo"),
    );
    const limbo = mainDeckRaw.filter((deck) =>
      deck.card.types.some((type) => type.name === "Limbo"),
    );

    return { mainDeck: main, limboDeck: limbo };
  }, [mainDeckRaw]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-600 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-300">
        Cargando mazo...
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="rounded-lg border border-dashed border-rose-200 bg-rose-50 py-10 text-center text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
        No se pudo cargar el mazo.
      </div>
    );
  }

  return (
    <div className="w-full">
      <ShowDeck
        deckListMain={mainDeck}
        deckListLimbo={limboDeck}
        deckListSide={sideDeck}
        allowEdit={false}
        highlightLegendaryCount
        onOpenDetail={noopOpenDetail}
      />
    </div>
  );
};
