"use client";

import Image from "next/image";
import Link from "next/link";
import { IoHeart, IoHeartOutline, IoTrophy } from "react-icons/io5";
import clsx from "clsx";
import { useMemo, useState, type MouseEvent, useEffect, useTransition } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { toggleDeckLikeAction } from "@/actions";
import type { Deck } from "@/interfaces";

interface Props {
  mazo: Deck;
  hasSession?: boolean;
  isLiked?: boolean;
  onLikedChange?: (deckId: string, liked: boolean) => void;
}

export const DeckCard = ({
  mazo,
  hasSession = false,
  isLiked = false,
  onLikedChange,
}: Props) => {
  // Like solo visual; no persiste.
  const [liked, setLiked] = useState(isLiked);
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

  const handleLikeClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!hasSession) {
      const query = searchParams?.toString();
      const currentUrl = query ? `${pathname}?${query}` : pathname;
      // Redirige al login preservando la ruta actual para volver despues de autenticar.
      router.push(
        `/auth/login?callbackUrl=${encodeURIComponent(currentUrl)}`,
      );
      return;
    }
    const nextLiked = !liked;
    setLiked(nextLiked);
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
          onLikedChange?.(mazo.id, reverted);
          return reverted;
        });
      }
    });
  };

  return (
    <article className="group relative h-full w-full border-2 border-slate-200 bg-transparent rounded-lg shadow-sm transition-all hover:shadow-md dark:border-tournament-dark-border overflow-hidden hover:-mt-2 duration-300">
      <button
        type="button"
        onClick={handleLikeClick}
        title="Marcar como favorito"
        aria-label="Marcar como favorito"
        className={clsx(
          "absolute right-2 top-2 z-20 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-purple-950/70 text-slate-100 shadow-sm transition hover:border-purple-400 hover:text-purple-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200",
          isPending && "opacity-70 cursor-not-allowed",
        )}
        disabled={isPending}
      >
        <span className="relative block h-5 w-5">
          <IoHeart
            className={clsx(
              "absolute inset-0 h-5 w-5 text-white transition-all duration-200 ease-out",
              liked ? "scale-110 opacity-100" : "scale-75 opacity-0",
            )}
          />
          <IoHeartOutline
            className={clsx(
              "absolute inset-0 h-5 w-5 transition-all duration-200 ease-out",
              liked ? "scale-75 opacity-0" : "scale-100 opacity-100",
            )}
          />
        </span>
      </button>

      <Link
        href={`/laboratorio?id=${mazo.id}`}
        className="block h-full rounded-lg"
      >
        <div className="relative h-56 w-full overflow-hidden">
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

        <div className="bg-purple-950/70 px-3 py-3 shadow-sm dark:bg-tournament-dark-surface/80">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="line-clamp-2 text-xs font-semibold tracking-[0.12em] text-slate-100">
                {mazo.name}
              </h3>
              <p className="text-xs text-slate-300">
                {mazo.user.nickname ?? "Sin jugador"}
              </p>
              <p className="text-xs text-slate-300">{formattedDate}</p>
            </div>

            <div className="flex min-w-[96px] flex-col items-end justify-between gap-2 self-stretch">
              <div className="rounded-md border border-purple-300/60 bg-purple-300/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-purple-100">
                {hasArchetype ? archetypeName : "Sin arquetipo"}
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
        </div>
      </Link>
    </article>
  );
};
