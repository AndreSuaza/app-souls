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
  name: string;
  rarityName: string | null;
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

const getCardLookupId = (value?: string) => {
  if (!value) return null;
  if (isCardReference(value)) return value;

  const normalized = value.split("?")[0];
  const match = normalized.match(/\/cards\/([^/]+)\.webp$/i);
  if (!match) return null;

  const filename = match[1];
  const lastDashIndex = filename.lastIndexOf("-");
  if (lastDashIndex === -1) return null;

  // El idd siempre va después del último guion en el nombre del archivo.
  return filename.slice(lastDashIndex + 1);
};

export const MarkdownCardPreview = ({ src, alt }: Props) => {
  const cardId = useMemo(() => getCardLookupId(src), [src]);
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
              name: card.name ?? "Carta",
              rarityName: card.rarityName ?? null,
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
  const finalAlt = cardId ? (resolvedCard?.name ?? "Carta") : (alt ?? "Carta");
  const rarityLabel = resolvedCard?.rarityName ?? "Sin rareza";

  if (!finalSrc && !cardId) return null;

  return (
    <div className="w-[140px] sm:w-[170px] md:w-[190px]">
      <div className="rounded-lg border border-transparent bg-white p-2 text-center shadow-sm transition hover:border-purple-400 dark:bg-tournament-dark-surface">
        <div className="content-visibility-auto overflow-hidden rounded-md bg-slate-950/70 dark:bg-tournament-dark-muted-strong/40">
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
              width={180}
              height={260}
              className="h-auto w-full rounded-md"
            />
          ) : null}
        </div>
        <span className="mt-2 block truncate text-xs text-slate-500 dark:text-slate-400">
          {resolvedCard?.name ?? alt ?? "Carta"}
        </span>
        <span className="block truncate text-[10px] text-slate-400 dark:text-slate-500">
          {rarityLabel}
        </span>
      </div>
    </div>
  );
};
