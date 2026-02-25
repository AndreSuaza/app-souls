"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getCardByIdAction } from "@/actions";

type Props = {
  src?: string;
  alt?: string;
};

type CardPreview = {
  src: string;
  alt: string;
};

const cardPreviewCache = new Map<string, CardPreview>();
const cardPreviewPromiseCache = new Map<string, Promise<CardPreview | null>>();

const isCardReference = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("http")) return false;
  if (trimmed.includes("/")) return false;
  if (trimmed.includes(".")) return false;
  if (!/^[0-9a-zA-Z]+$/.test(trimmed)) return false;
  return true;
};

export const MarkdownCardImage = ({ src, alt }: Props) => {
  const cardId = useMemo(() => {
    if (!src) return null;
    return isCardReference(src) ? src : null;
  }, [src]);
  const [resolvedCard, setResolvedCard] = useState<CardPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (!cardId) {
      setResolvedCard(null);
      setIsLoading(false);
      setHasError(false);
      return () => {
        isActive = false;
      };
    }

    const cached = cardPreviewCache.get(cardId);
    if (cached) {
      setResolvedCard(cached);
      setIsLoading(false);
      setHasError(false);
      return () => {
        isActive = false;
      };
    }

    const loadCard = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        let promise = cardPreviewPromiseCache.get(cardId);
        if (!promise) {
          promise = (async () => {
            const card = await getCardByIdAction({ cardId });
            if (!card) return null;
            return {
              src: `/cards/${card.code}-${card.idd}.webp`,
              alt: card.name ?? "Carta",
            };
          })();
          cardPreviewPromiseCache.set(cardId, promise);
        }

        const preview = await promise;
        if (!isActive) return;

        if (!preview) {
          setHasError(true);
          return;
        }

        cardPreviewCache.set(cardId, preview);
        setResolvedCard(preview);
      } catch {
        if (!isActive) return;
        setHasError(true);
      } finally {
        if (!isActive) return;
        setIsLoading(false);
        cardPreviewPromiseCache.delete(cardId);
      }
    };

    void loadCard();

    return () => {
      isActive = false;
    };
  }, [cardId]);

  const finalSrc = cardId ? resolvedCard?.src : src;
  const finalAlt = cardId ? resolvedCard?.alt ?? "Carta" : alt ?? "Carta";

  if (!finalSrc && !cardId) return null;

  return (
    <div className="w-[140px] sm:w-[170px] md:w-[190px]">
      <div className="relative rounded-lg bg-slate-950/70 shadow-sm dark:bg-tournament-dark-muted-strong/40">
        <div className="content-visibility-auto overflow-hidden rounded-lg">
          {isLoading && cardId ? (
            <div className="flex h-[200px] items-center justify-center text-xs text-slate-400">
              Cargando carta...
            </div>
          ) : hasError && cardId ? (
            <div className="flex h-[200px] items-center justify-center text-xs text-rose-400">
              Carta no encontrada
            </div>
          ) : finalSrc ? (
            <Image
              src={finalSrc}
              alt={finalAlt}
              className="block h-auto w-full object-cover"
              width={500}
              height={718}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
