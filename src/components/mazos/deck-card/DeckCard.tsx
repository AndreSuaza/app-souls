"use client";

import Image from "next/image";
import Link from "next/link";
import {
  IoHeart,
  IoHeartOutline,
  IoLockClosed,
  IoTrash,
  IoTrophy,
} from "react-icons/io5";
import clsx from "clsx";
import {
  useMemo,
  useState,
  type MouseEvent,
  useEffect,
  useTransition,
} from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { toggleDeckLikeAction } from "@/actions";
import type { Deck } from "@/interfaces";

interface Props {
  mazo: Deck;
  hasSession?: boolean;
  isLiked?: boolean;
  onLikedChange?: (deckId: string, liked: boolean) => void;
  showLikeButton?: boolean;
  disableLikeButton?: boolean;
  showDeleteButton?: boolean;
  onDeleteClick?: (deckId: string) => void;
  href?: string;
  onCardClick?: (deck: Deck, event: MouseEvent<HTMLAnchorElement>) => void;
}

export const DeckCard = ({
  mazo,
  hasSession = false,
  isLiked = false,
  onLikedChange,
  showLikeButton = true,
  disableLikeButton = false,
  showDeleteButton = false,
  onDeleteClick,
  href,
  onCardClick,
}: Props) => {
  // Like solo visual; no persiste.
  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(mazo.likesCount);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const archetypeName = mazo.archetype?.name ?? "";
  const hasArchetype = archetypeName.trim().length > 0;
  const formattedDate = useMemo(() => {
    const date = new Date(mazo.createdAt);
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [mazo.createdAt]);

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setLikesCount(mazo.likesCount);
  }, [mazo.likesCount]);

  const displayLiked = liked;

  const handleLikeClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disableLikeButton) return;
    if (!hasSession) {
      const query = searchParams?.toString();
      const currentUrl = query ? `${pathname}?${query}` : pathname;
      // Redirige al login preservando la ruta actual para volver despues de autenticar.
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
      return;
    }
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => {
      const nextCount = nextLiked ? prev + 1 : prev - 1;
      return Math.max(0, nextCount);
    });
    onLikedChange?.(mazo.id, nextLiked);

    startTransition(async () => {
      try {
        const result = await toggleDeckLikeAction({
          deckId: mazo.id,
          like: nextLiked,
        });
        setLiked(result.liked);
        onLikedChange?.(mazo.id, result.liked);
      } catch {
        // Revierte el estado visual si falla el guardado en DB.
        setLiked((prev) => {
          const reverted = !prev;
          setLikesCount((count) => {
            const nextCount = reverted ? count + 1 : count - 1;
            return Math.max(0, nextCount);
          });
          onLikedChange?.(mazo.id, reverted);
          return reverted;
        });
      }
    });
  };

  return (
    <article className="group relative h-full w-full border-2 border-slate-200 bg-transparent rounded-lg shadow-sm transition-all hover:shadow-md dark:border-tournament-dark-border overflow-hidden duration-300 transform-gpu hover:-translate-y-2">
      {(showLikeButton || showDeleteButton || !mazo.visible) && (
        <>
          {(showDeleteButton || !mazo.visible) && (
            <div className="absolute left-2 top-2 z-20 flex flex-col items-start gap-1">
              {showDeleteButton && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onDeleteClick?.(mazo.id);
                  }}
                  title="Eliminar mazo"
                  aria-label="Eliminar mazo"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-200/80 text-purple-600 transition hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white"
                >
                  <IoTrash className="h-4 w-4" />
                </button>
              )}

              {mazo.visible === false && (
                <span
                  title="Mazo privado"
                  aria-label="Mazo privado"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/80 text-purple-600 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white"
                >
                  <IoLockClosed className="h-4 w-4" />
                </span>
              )}
            </div>
          )}

          {showLikeButton && (
            <div className="absolute right-2 top-2 z-20 flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={handleLikeClick}
                title="Marcar como favorito"
                aria-label="Marcar como favorito"
                className={clsx(
                  "inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-200/80 px-2 text-purple-700 transition dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200",
                  disableLikeButton
                    ? "opacity-80"
                    : "hover:border-purple-400 hover:text-purple-600",
                  isPending && "opacity-70 cursor-not-allowed",
                )}
                disabled={isPending || disableLikeButton}
              >
                <span className="relative block h-5 w-5">
                  <IoHeart
                    className={clsx(
                      "absolute inset-0 h-5 w-5 text-[#ff3040] transition-all duration-200 ease-out",
                      displayLiked
                        ? "scale-110 opacity-100"
                        : "scale-75 opacity-0",
                    )}
                  />
                  <IoHeartOutline
                    className={clsx(
                      "absolute inset-0 h-5 w-5 transition-all duration-200 ease-out",
                      displayLiked
                        ? "scale-75 opacity-0"
                        : "scale-100 opacity-100",
                    )}
                  />
                </span>
                <span className="text-[10px] font-semibold leading-none">
                  {likesCount}
                </span>
              </button>
            </div>
          )}
        </>
      )}

      <Link
        href={href ?? `/mazos/${mazo.id}`}
        className="flex h-full flex-col rounded-lg"
        onClick={(event) => onCardClick?.(mazo, event)}
      >
        <div className="relative h-56 w-full shrink-0 overflow-hidden">
          <Image
            src={`/cards/${mazo.imagen}.webp`}
            alt={mazo.name}
            fill
            sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 28vw, 46vw"
            className="scale-110 object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        <div className="flex flex-1 flex-col bg-slate-200/80 px-3 py-3 shadow-sm dark:bg-tournament-dark-surface/80">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-xs font-semibold tracking-[0.12em] text-slate-800 dark:text-slate-100">
              {mazo.name}
            </h3>
            <div className="flex min-w-[96px] justify-end">
              <div className="rounded-md border border-purple-300 bg-purple-200/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-purple-700 dark:border-purple-300/60 dark:bg-purple-300/15 dark:text-purple-100">
                {hasArchetype ? archetypeName : "Sin arquetipo"}
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 pt-2">
            <div className="space-y-1">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {mazo.user.nickname ?? "Sin jugador"}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {formattedDate}
              </p>
            </div>
            {mazo.tournamentId ? (
              <div
                className="inline-flex h-8 w-8 items-center justify-center"
                title="Mazo usado en torneo"
              >
                <IoTrophy className="h-5 w-5 text-amber-400" />
              </div>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
};
