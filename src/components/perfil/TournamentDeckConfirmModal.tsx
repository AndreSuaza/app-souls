"use client";

import { useEffect, useState } from "react";
import { getDeckFiltersAction, getDecksByIds } from "@/actions";
import type { ArchetypeOption, Deck, Decklist } from "@/interfaces";
import { DeckDetailView } from "../mazos/deck-detail/DeckDetailView";
import { Modal } from "../ui/modal/modal";

type Props = {
  deck: Deck;
  hasSession: boolean;
  onConfirm: () => void;
  onChangeDeck: () => void;
  onClose: () => void;
};

export const TournamentDeckConfirmModal = ({
  deck,
  hasSession,
  onConfirm,
  onChangeDeck,
  onClose,
}: Props) => {
  const [mainDeck, setMainDeck] = useState<Decklist[]>([]);
  const [sideDeck, setSideDeck] = useState<Decklist[]>([]);
  const [archetypes, setArchetypes] = useState<ArchetypeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadDeckDetail = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const decklistCards = deck.cards?.replaceAll("%2C", ",") ?? "";
        // Replica la vista de /mazos/[id] cargando el detalle completo del mazo.
        const [deckLists, filters] = await Promise.all([
          getDecksByIds(decklistCards),
          getDeckFiltersAction(),
        ]);

        if (!isActive) return;

        setMainDeck(deckLists.mainDeck);
        setSideDeck(deckLists.sideDeck);
        setArchetypes(filters.archetypes ?? []);
      } catch (error) {
        if (!isActive) return;
        console.error("[tournament-deck-confirm]", error);
        setHasError(true);
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    };

    void loadDeckDetail();

    return () => {
      isActive = false;
    };
  }, [deck.cards, deck.id]);

  const primaryButtonClass =
    "inline-flex h-10 items-center justify-center rounded-lg bg-yellow-400 px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60";
  const secondaryButtonClass =
    "inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-purple-300 hover:text-purple-600 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:text-purple-300 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <Modal
      className="left-1/2 top-1/2 w-[96%] max-w-6xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white shadow-2xl transition-all dark:border-tournament-dark-border dark:bg-tournament-dark-surface overflow-hidden"
      close={onClose}
    >
      <div className="flex max-h-[90vh] w-full flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
          <p className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
            ¿Estás seguro de que este es el mazo que deseas asociar?
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
            Revisa el detalle antes de confirmarlo.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-5">
          {isLoading && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-600 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-300">
              Cargando detalle del mazo...
            </div>
          )}

          {hasError && !isLoading && (
            <div className="rounded-lg border border-dashed border-rose-200 bg-rose-50 py-10 text-center text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              No se pudo cargar el detalle del mazo. Intenta de nuevo.
            </div>
          )}

          {!isLoading && !hasError && (
            <DeckDetailView
              deck={deck}
              mainDeck={mainDeck}
              sideDeck={sideDeck}
              hasSession={hasSession}
              archetypes={archetypes}
              isOwner
            />
          )}
        </div>

        <div className="border-t border-slate-200 bg-white px-5 py-4 dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onChangeDeck}
              className={secondaryButtonClass}
              disabled={isLoading}
            >
              Cambiar mazo
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={primaryButtonClass}
              disabled={isLoading || hasError}
            >
              Confirmar mazo
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
