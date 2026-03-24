"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { IoTrashOutline } from "react-icons/io5";
import { PaginationLine } from "@/components/ui";
import { deleteDeckAction } from "@/actions";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import type { AdminDeckListItem } from "@/interfaces";
import { AdminDecksSearch } from "./AdminDecksSearch";

type Props = {
  decks: AdminDeckListItem[];
  onDeleted?: (id: string) => void;
};

const PAGE_SIZE = 10;

export const AdminDecksList = ({ decks, onDeleted }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const prevQueryRef = useRef(query);

  const pageParam = Number(searchParams.get("page") ?? 1);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return decks;
    return decks.filter((deck) => {
      const nameMatch = deck.name.toLowerCase().includes(term);
      const authorMatch =
        deck.authorName?.toLowerCase().includes(term) ||
        deck.userNickname?.toLowerCase().includes(term);
      return nameMatch || Boolean(authorMatch);
    });
  }, [decks, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    // Evita filtrar y resetear paginación en cada tecla.
    const timeoutId = setTimeout(() => {
      setQuery(inputValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  useEffect(() => {
    if (prevQueryRef.current === query) return;
    prevQueryRef.current = query;

    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  }, [query, pathname, router, searchParams]);

  useEffect(() => {
    if (currentPage > totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set("page", totalPages.toString());
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [currentPage, totalPages, pathname, router, searchParams]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleDelete = (id: string) => {
    openConfirmation({
      text: "¿Deseas eliminar este mazo?",
      description: "Esta acción no se puede deshacer.",
      action: async () => {
        showLoading("Eliminando mazo...");
        await deleteDeckAction({ deckId: id });
        hideLoading();
        return true;
      },
      onSuccess: () => {
        showToast("Mazo eliminado", "success");
        onDeleted?.(id);
      },
      onError: () => {
        hideLoading();
        showToast("No se pudo eliminar el mazo", "error");
      },
    });
  };

  const handleRowClick = (id: string) => {
    router.push(`/admin/mazos/laboratorio?id=${id}`);
  };

  return (
    <div className="space-y-6">
      <AdminDecksSearch
        query={inputValue}
        totalCount={filtered.length}
        onChange={setInputValue}
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-tournament-dark-accent bg-white p-6 text-center text-sm text-slate-500 dark:border-tournament-dark-accent dark:bg-tournament-dark-surface dark:text-slate-300">
          No hay mazos para mostrar.
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-xl border border-tournament-dark-accent bg-white shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-tournament-dark-border/60 text-xs uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Mazo</th>
                    <th className="px-4 py-3">Arquetipo</th>
                    <th className="px-4 py-3">Autor</th>
                    <th className="px-4 py-3">Cartas</th>
                    <th className="px-4 py-3">Creación</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((deck) => (
                    <tr
                      key={deck.id}
                      role="button"
                      onClick={() => handleRowClick(deck.id)}
                      className="cursor-pointer border-b border-tournament-dark-border/40 text-slate-700 transition hover:bg-slate-50 last:border-b-0 dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {deck.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {deck.userNickname ?? "Sin usuario"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {deck.archetypeName ?? "Sin arquetipo"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {deck.authorName ?? "Sin autor"}
                      </td>
                      <td className="px-4 py-3 text-xs">{deck.cardsNumber}</td>
                      <td className="px-4 py-3 text-xs">
                        {new Date(deck.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          title="Eliminar"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(deck.id);
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500 text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-500/10"
                        >
                          <IoTrashOutline size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {paginated.map((deck) => (
              <div
                key={deck.id}
                role="button"
                onClick={() => handleRowClick(deck.id)}
                className="rounded-xl border border-tournament-dark-accent bg-white p-4 shadow-sm transition hover:bg-slate-50 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:hover:bg-tournament-dark-muted"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {deck.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {deck.archetypeName ?? "Sin arquetipo"}
                    </p>
                  </div>
                  <button
                    type="button"
                    title="Eliminar"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(deck.id);
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500 text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-500/10"
                  >
                    <IoTrashOutline size={16} />
                  </button>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <p>Autor: {deck.authorName ?? "Sin autor"}</p>
                  <p>Cartas: {deck.cardsNumber}</p>
                  <p>
                    Creación: {new Date(deck.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <PaginationLine
            totalPages={totalPages}
            currentPage={currentPage}
            pathname={pathname}
            searchParams={searchParams}
          />
        </>
      )}
    </div>
  );
};
