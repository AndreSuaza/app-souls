"use client";

import Image from "next/image";
import Link from "next/link";
import { IoHeartOutline, IoTrophyOutline } from "react-icons/io5";
import { useMemo, useState, type MouseEvent } from "react";

interface User {
  nickname: string | null;
}

interface Archetype {
  name: string | null;
}

interface Deck {
  id: string;
  name: string;
  imagen: string;
  cards: string;
  likesCount: number;
  createdAt: Date | string;
  tournamentId?: string | null;
  user: User;
  archetype: Archetype;
}

interface Props {
  mazo: Deck;
  hasSession?: boolean;
}

export const DeckCard = ({ mazo, hasSession = false }: Props) => {
  // El like es solo visual por ahora; no persiste en DB.
  const [liked, setLiked] = useState(false);

  const formattedDate = useMemo(() => {
    const date = new Date(mazo.createdAt);
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [mazo.createdAt]);

  const handleLikeClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!hasSession) return;
    setLiked((prev) => !prev);
  };

  return (
    <article className="group relative h-full overflow-hidden rounded-lg border border-slate-200 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:border-purple-400 hover:shadow-md dark:border-tournament-dark-border dark:bg-tournament-dark-surface/80">
      {mazo.tournamentId && (
        <div className="absolute left-2 top-2 z-20 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/90 text-amber-500 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
          <IoTrophyOutline className="h-5 w-5" />
        </div>
      )}

      <button
        type="button"
        onClick={handleLikeClick}
        disabled={!hasSession}
        title={
          hasSession ? "Marcar como favorito" : "Inicia sesion para dar like"
        }
        aria-label={
          hasSession ? "Marcar como favorito" : "Inicia sesion para dar like"
        }
        className="absolute right-2 top-2 z-20 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/90 text-slate-600 shadow-sm transition hover:border-purple-400 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200"
      >
        <IoHeartOutline
          className={liked ? "h-5 w-5 text-purple-500" : "h-5 w-5"}
        />
      </button>

      <Link href={`/laboratorio?id=${mazo.id}`} className="block h-full">
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src="/decks/Mokut-Deckbox.webp"
            alt="Diseno de mazo"
            fill
            sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 28vw, 46vw"
            className="object-cover"
            priority={false}
          />

          {/* Overlay fijo para evitar saltos visuales al cargar la imagen del mazo. */}
          <div className="absolute left-1/2 top-[62%] h-[152px] w-[112px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-white/70 shadow-lg dark:border-tournament-dark-border">
            <Image
              src={`/cards/${mazo.imagen}.webp`}
              alt={mazo.name}
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        </div>

        <div className="space-y-1 px-3 pb-4 pt-3">
          <h3 className="line-clamp-2 text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
            {mazo.name}
          </h3>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Arquetipo: {mazo.archetype.name}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{formattedDate}</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {mazo.likesCount} likes
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};
