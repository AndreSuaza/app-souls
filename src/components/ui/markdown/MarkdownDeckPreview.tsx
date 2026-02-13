"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getDeckById,
  getDeckLikeStatusAction,
  getDecksByIds,
  getTournamentSummaryAction,
} from "@/actions";
import type { Deck, Decklist } from "@/interfaces";
import { ShowDeck } from "@/components/cartas/deck-creator/ShowDeck";
import { DeckInfoPanel } from "@/components/mazos/deck-detail/DeckInfoPanel";

type Props = {
  decklist?: string;
  deckId?: string;
};

type DeckPreviewCache = {
  deck: Deck | null;
  tournamentName: string | null;
  isLiked: boolean;
  mainDeckRaw: Decklist[];
  sideDeck: Decklist[];
};

const deckPreviewCache = new Map<string, DeckPreviewCache>();

const noopOpenDetail = () => {};

export const MarkdownDeckPreview = ({ decklist, deckId }: Props) => {
  const { data: session } = useSession();
  const hasSession = Boolean(session?.user);
  const userKey = session?.user?.idd ?? "anon";
  const [deck, setDeck] = useState<Deck | null>(null);
  const [tournamentName, setTournamentName] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [mainDeckRaw, setMainDeckRaw] = useState<Decklist[]>([]);
  const [sideDeck, setSideDeck] = useState<Decklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadByDeckId = async (resolvedId: string) => {
      const cacheKey = `deck:${resolvedId}:user:${userKey}`;
      const cached = deckPreviewCache.get(cacheKey);
      if (cached) {
        if (!isActive) return;
        setDeck(cached.deck);
        setTournamentName(cached.tournamentName);
        setIsLiked(cached.isLiked);
        setMainDeckRaw(cached.mainDeckRaw);
        setSideDeck(cached.sideDeck);
        setIsLoading(false);
        setHasError(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);
      try {
        const deckData = await getDeckById(resolvedId);
        if (!deckData) {
          if (!isActive) return;
          setHasError(true);
          return;
        }

        const decklistCards = deckData.cards?.replaceAll("%2C", ",") ?? "";
        const [deckLists, tournamentSummary, likeStatus] = await Promise.all([
          getDecksByIds(decklistCards),
          deckData.tournamentId
            ? getTournamentSummaryAction(deckData.tournamentId)
            : Promise.resolve(null),
          getDeckLikeStatusAction(deckData.id),
        ]);

        if (!isActive) return;
        setDeck(deckData);
        setTournamentName(tournamentSummary?.title ?? null);
        setIsLiked(likeStatus.liked);
        setMainDeckRaw(deckLists.mainDeck);
        setSideDeck(deckLists.sideDeck);
        deckPreviewCache.set(cacheKey, {
          deck: deckData,
          tournamentName: tournamentSummary?.title ?? null,
          isLiked: likeStatus.liked,
          mainDeckRaw: deckLists.mainDeck,
          sideDeck: deckLists.sideDeck,
        });
      } catch (error) {
        console.error("[markdown-deck-preview]", error);
        if (!isActive) return;
        setHasError(true);
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    };

    const loadByDecklist = async (rawDecklist: string) => {
      const normalized = rawDecklist.trim().replaceAll("%2C", ",");
      const cacheKey = `decklist:${normalized}`;
      const cached = deckPreviewCache.get(cacheKey);
      if (cached) {
        if (!isActive) return;
        setDeck(cached.deck);
        setTournamentName(cached.tournamentName);
        setIsLiked(cached.isLiked);
        setMainDeckRaw(cached.mainDeckRaw);
        setSideDeck(cached.sideDeck);
        setIsLoading(false);
        setHasError(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);
      try {
        const { mainDeck, sideDeck: side } = await getDecksByIds(normalized);

        if (!isActive) return;
        setDeck(null);
        setTournamentName(null);
        setIsLiked(false);
        setMainDeckRaw(mainDeck);
        setSideDeck(side);
        deckPreviewCache.set(cacheKey, {
          deck: null,
          tournamentName: null,
          isLiked: false,
          mainDeckRaw: mainDeck,
          sideDeck: side,
        });
      } catch (error) {
        console.error("[markdown-deck-preview]", error);
        if (!isActive) return;
        setHasError(true);
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    };

    if (deckId) {
      void loadByDeckId(deckId);
    } else if (decklist) {
      void loadByDecklist(decklist);
    } else {
      setIsLoading(false);
      setHasError(true);
    }

    return () => {
      isActive = false;
    };
  }, [deckId, decklist, userKey]);

  const { mainDeck, limboDeck } = useMemo(() => {
    const main = mainDeckRaw.filter(
      (deckItem) =>
        !deckItem.card.types.some((type) => type.name === "Limbo"),
    );
    const limbo = mainDeckRaw.filter((deckItem) =>
      deckItem.card.types.some((type) => type.name === "Limbo"),
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
    <div className="w-full space-y-4">
      {deck && (
        <DeckInfoPanel
          deck={deck}
          tournamentName={tournamentName}
          hasSession={hasSession}
          isLiked={isLiked}
        />
      )}
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
