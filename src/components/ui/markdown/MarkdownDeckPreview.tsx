"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getDeckById,
  getDeckLikeStatusAction,
  getDecksByIds,
  getTournamentSummaryAction,
} from "@/actions";
import type { Deck, Decklist } from "@/interfaces";
import { DeckInfoPanel } from "@/components/mazos/deck-detail/DeckInfoPanel";
import { DeckSection } from "@/components/cartas/deck-creator/DeckSection";
import clsx from "clsx";
import { MarkdownDeckStackGrid } from "./MarkdownDeckStackGrid";

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

export const MarkdownDeckPreview = ({ decklist, deckId }: Props) => {
  const { data: session } = useSession();
  const hasSession = Boolean(session?.user);
  const userKey = session?.user?.idd ?? "anon";
  const gridWrapperRef = useRef<HTMLDivElement | null>(null);
  const autoColumnsRef = useRef<number | null>(null);
  const [autoColumns, setAutoColumns] = useState<number | null>(null);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [tournamentName, setTournamentName] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [mainDeckRaw, setMainDeckRaw] = useState<Decklist[]>([]);
  const [sideDeck, setSideDeck] = useState<Decklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState({
    limbo: true,
    main: true,
    side: true,
  });

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
      (deckItem) => !deckItem.card.types.some((type) => type.name === "Limbo"),
    );
    const limbo = mainDeckRaw.filter((deckItem) =>
      deckItem.card.types.some((type) => type.name === "Limbo"),
    );

    return { mainDeck: main, limboDeck: limbo };
  }, [mainDeckRaw]);

  useEffect(() => {
    const element = gridWrapperRef.current;
    if (!element) return;

    const GRID_CARD_MIN_WIDTH = 150;
    const GRID_GAP_PX = 8;

    const calculateColumns = (width: number) => {
      const nextColumns = Math.floor(
        (width + GRID_GAP_PX) / (GRID_CARD_MIN_WIDTH + GRID_GAP_PX),
      );
      return Math.max(1, Math.min(8, nextColumns));
    };

    // Ajusta columnas para igualar la distribución de /mazos/[id].
    const updateColumns = (width: number) => {
      const nextValue = calculateColumns(width);
      if (autoColumnsRef.current !== nextValue) {
        autoColumnsRef.current = nextValue;
        setAutoColumns(nextValue);
      }
    };

    let frameId: number | null = null;
    let pendingWidth = element.getBoundingClientRect().width;

    const requestUpdate = (width: number) => {
      pendingWidth = width;
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateColumns(pendingWidth);
      });
    };

    requestUpdate(element.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        requestUpdate(entry.contentRect.width);
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const mainCount = mainDeck.reduce((acc, deck) => acc + deck.count, 0);
  const limboCount = limboDeck.reduce((acc, deck) => acc + deck.count, 0);
  const sideCount = sideDeck.reduce((acc, deck) => acc + deck.count, 0);

  const sectionBaseContainerClass =
    "rounded-lg border border-l-4 bg-slate-100/80 text-slate-800 dark:bg-tournament-dark-surface/90 dark:text-slate-100";
  const sectionBaseHeaderClass =
    "relative flex w-full flex-wrap items-start gap-2 border-b bg-slate-200/50 px-3 py-2 pr-6 text-left text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:bg-slate-200/90 dark:bg-tournament-dark-muted/70 dark:text-slate-100 dark:hover:bg-purple-500/10 sm:text-sm";
  const sectionStyles = {
    limbo: {
      container:
        "border-amber-200/80 border-l-amber-500 shadow-[inset_4px_0_10px_rgba(245,158,11,0.2)] dark:border-amber-500/30 dark:border-l-amber-400 dark:shadow-[inset_4px_0_12px_rgba(245,158,11,0.35)]",
      header: "border-b-amber-200/80 dark:border-b-amber-500/30",
      title: "text-amber-600 dark:text-amber-300",
      chevron: "text-amber-500 dark:text-amber-300",
    },
    main: {
      container:
        "border-purple-200/80 border-l-purple-500 shadow-[inset_4px_0_10px_rgba(139,92,246,0.2)] dark:border-purple-500/30 dark:border-l-purple-400 dark:shadow-[inset_4px_0_12px_rgba(139,92,246,0.35)]",
      header: "border-b-purple-200/80 dark:border-b-purple-500/30",
      title: "text-purple-600 dark:text-purple-300",
      chevron: "text-purple-500 dark:text-purple-300",
    },
    side: {
      container:
        "border-sky-200/80 border-l-sky-500 shadow-[inset_4px_0_10px_rgba(56,189,248,0.2)] dark:border-sky-500/30 dark:border-l-sky-400 dark:shadow-[inset_4px_0_12px_rgba(56,189,248,0.35)]",
      header: "border-b-sky-200/80 dark:border-b-sky-500/30",
      title: "text-sky-600 dark:text-sky-300",
      chevron: "text-sky-500 dark:text-sky-300",
    },
  };
  const sectionBodyClass = "px-3 pb-3 pt-3 sm:px-4 sm:pb-4";

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
      <div ref={gridWrapperRef} className="mb-6 flex flex-col gap-4">
        <DeckSection
          title="Mazo Limbo"
          count={limboCount}
          isOpen={sectionsOpen.limbo}
          ariaLabel="Mostrar u ocultar mazo limbo"
          onToggle={() => toggleSection("limbo")}
          containerClassName={clsx(
            sectionBaseContainerClass,
            sectionStyles.limbo.container,
          )}
          headerClassName={clsx(
            sectionBaseHeaderClass,
            sectionStyles.limbo.header,
          )}
          titleClassName={sectionStyles.limbo.title}
          chevronClassName={sectionStyles.limbo.chevron}
          countClassName={clsx(
            "rounded-md border bg-transparent px-2 py-0.5 text-[10px] font-semibold dark:shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80",
            sectionStyles.limbo.title,
            "border-amber-300/70 dark:border-tournament-dark-border",
          )}
          titleWrapperClassName="flex flex-1 flex-wrap items-center gap-1 min-w-0 sm:gap-2"
          bodyClassName={sectionBodyClass}
        >
          {sectionsOpen.limbo && (
            <MarkdownDeckStackGrid
              decklist={limboDeck}
              columns={autoColumns ?? undefined}
            />
          )}
        </DeckSection>

        <DeckSection
          title="Mazo Principal"
          count={mainCount}
          isOpen={sectionsOpen.main}
          ariaLabel="Mostrar u ocultar mazo principal"
          onToggle={() => toggleSection("main")}
          containerClassName={clsx(
            sectionBaseContainerClass,
            sectionStyles.main.container,
          )}
          headerClassName={clsx(
            sectionBaseHeaderClass,
            sectionStyles.main.header,
          )}
          titleClassName={sectionStyles.main.title}
          chevronClassName={sectionStyles.main.chevron}
          countClassName={clsx(
            "rounded-md border bg-transparent px-2 py-0.5 text-[10px] font-semibold shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80",
            sectionStyles.main.title,
            "border-purple-300/70 dark:border-tournament-dark-border",
          )}
          titleWrapperClassName="flex flex-1 flex-wrap items-center gap-2 min-w-0"
          bodyClassName={sectionBodyClass}
        >
          {sectionsOpen.main && (
            <MarkdownDeckStackGrid
              decklist={mainDeck}
              columns={autoColumns ?? undefined}
            />
          )}
        </DeckSection>

        <DeckSection
          title="Mazo Apoyo"
          count={sideCount}
          isOpen={sectionsOpen.side}
          ariaLabel="Mostrar u ocultar mazo apoyo"
          onToggle={() => toggleSection("side")}
          containerClassName={clsx(
            sectionBaseContainerClass,
            sectionStyles.side.container,
          )}
          headerClassName={clsx(
            sectionBaseHeaderClass,
            sectionStyles.side.header,
          )}
          titleClassName={sectionStyles.side.title}
          chevronClassName={sectionStyles.side.chevron}
          countClassName={clsx(
            "rounded-md border bg-transparent px-2 py-0.5 text-[10px] font-semibold shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80",
            sectionStyles.side.title,
            "border-sky-300/70 dark:border-tournament-dark-border",
          )}
          titleWrapperClassName="flex flex-1 flex-wrap items-center gap-2 min-w-0"
          bodyClassName={sectionBodyClass}
        >
          {sectionsOpen.side && (
            <MarkdownDeckStackGrid
              decklist={sideDeck}
              columns={autoColumns ?? undefined}
            />
          )}
        </DeckSection>
      </div>
    </div>
  );
};
