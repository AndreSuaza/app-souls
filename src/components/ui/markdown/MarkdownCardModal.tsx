"use client";

import clsx from "clsx";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { PaginationLine } from "@/components/ui/pagination/paginationLine";
import { Modal } from "../modal/modal";

type CardSearchResult = {
  id: string;
  name: string;
  code: string;
  idd: string;
  rarityName?: string | null;
};

const EMPTY_SEARCH_PARAMS = new URLSearchParams() as ReadonlyURLSearchParams;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  cards: CardSearchResult[];
  selectedCardIds: Set<string>;
  onToggleCard: (card: CardSearchResult) => void;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  selectedCount: number;
  onInsert: () => void;
};

export const MarkdownCardModal = ({
  isOpen,
  onClose,
  searchValue,
  onSearchChange,
  cards,
  selectedCardIds,
  onToggleCard,
  isLoading,
  error,
  totalCount,
  totalPages,
  currentPage,
  onPageChange,
  selectedCount,
  onInsert,
}: Props) => {
  if (!isOpen) return null;

  return (
    <Modal
      className="inset-0 flex items-center justify-center p-4"
      close={onClose}
      hideCloseButton
    >
      <div className="w-full max-w-4xl rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Seleccionar cartas
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Selecciona una o varias cartas. Puedes buscar por nombre, id,
                idd o codigo.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-tournament-dark-accent text-slate-500 transition hover:bg-slate-100 hover:text-purple-600 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-muted dark:hover:text-purple-300"
              aria-label="Cerrar"
              title="Cerrar"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-center gap-2">
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar por nombre, id, idd o codigo"
              className="w-full min-w-0 rounded-lg border border-tournament-dark-accent bg-white p-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500"
            />
            <span className="whitespace-nowrap text-end text-xs text-slate-400 dark:text-slate-500">
              {totalCount} resultados
            </span>
          </div>

          <div className="relative max-h-[360px] min-h-[360px] overflow-y-auto rounded-lg border border-dashed border-tournament-dark-accent bg-slate-50 p-3 dark:border-tournament-dark-border dark:bg-tournament-dark-muted-strong">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {cards.map((card) => {
                const src = `/cards/${card.code}-${card.idd}.webp`;
                const isSelected = selectedCardIds.has(card.id);

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => onToggleCard(card)}
                    className={clsx(
                      "relative rounded-lg border bg-white p-2 text-center transition hover:border-purple-400 dark:bg-tournament-dark-surface",
                      isSelected
                        ? "border-purple-500 ring-2 ring-purple-400/40"
                        : "border-transparent",
                    )}
                  >
                    <Image
                      src={src}
                      alt={card.name}
                      width={160}
                      height={230}
                      className="h-auto w-full rounded-md"
                    />
                    <span className="mt-2 block truncate text-xs text-slate-500 dark:text-slate-400">
                      {card.name}
                    </span>
                    <span className="block truncate text-[10px] text-slate-400 dark:text-slate-500">
                      {card.rarityName ?? "Sin rareza"}
                    </span>
                  </button>
                );
              })}
            </div>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 text-sm text-slate-500 backdrop-blur-sm dark:bg-tournament-dark-muted-strong/80 dark:text-slate-300">
                Buscando cartas...
              </div>
            )}
            {error && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-rose-500 dark:text-rose-300">
                {error}
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <PaginationLine
              currentPage={currentPage}
              totalPages={totalPages}
              searchParams={EMPTY_SEARCH_PARAMS}
              pathname=""
              onPageChange={onPageChange}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {selectedCount} seleccionadas
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onInsert}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-700"
                disabled={selectedCount === 0}
              >
                Insertar cartas
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
