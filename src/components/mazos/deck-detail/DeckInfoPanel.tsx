"use client";

import {
  useMemo,
  useState,
  useEffect,
  useTransition,
  type MouseEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  IoChevronDownOutline,
  IoHeart,
  IoHeartOutline,
  IoTrophy,
} from "react-icons/io5";
import clsx from "clsx";
import { toggleDeckLikeAction } from "@/actions";
import type { Deck } from "@/interfaces";

interface Props {
  deck: Deck;
  tournamentName?: string | null;
  hasSession?: boolean;
  isLiked?: boolean;
}

export const DeckInfoPanel = ({
  deck,
  tournamentName,
  hasSession = false,
  isLiked = false,
}: Props) => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(deck.likesCount);
  const [, startTransition] = useTransition();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const playerName = useMemo(() => {
    const name = `${deck.user.name ?? ""} ${deck.user.lastname ?? ""}`.trim();
    return name.length > 0 ? name : "Sin nombre";
  }, [deck.user.name, deck.user.lastname]);

  const nickname = deck.user.nickname ?? "Sin jugador";
  const archetypeName = deck.archetype?.name?.trim() || "Sin arquetipo";
  const description = deck.description?.trim() || "Sin descripción disponible.";
  const infoTextClass =
    "text-lg sm:text-xl font-semibold tracking-[0.10em] text-slate-700 dark:text-slate-100";
  const subTextClass =
    "text-xs font-semibold tracking-[0.12em] text-slate-600 dark:text-slate-200";
  const hoverTextClass =
    "transition-colors hover:text-purple-600 dark:hover:text-purple-300";

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setLikesCount(deck.likesCount);
  }, [deck.likesCount]);

  const handleLikeClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!hasSession) {
      const query = searchParams?.toString();
      const currentUrl = query ? `${pathname}?${query}` : pathname;
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
      return;
    }
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => {
      const nextCount = nextLiked ? prev + 1 : prev - 1;
      return Math.max(0, nextCount);
    });

    startTransition(async () => {
      try {
        const result = await toggleDeckLikeAction({
          deckId: deck.id,
          like: nextLiked,
        });
        setLiked(result.liked);
      } catch {
        setLiked((prev) => {
          const reverted = !prev;
          setLikesCount((count) => {
            const nextCount = reverted ? count + 1 : count - 1;
            return Math.max(0, nextCount);
          });
          return reverted;
        });
      }
    });
  };

  return (
    <section className="text-slate-700 dark:text-slate-100">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-6 w-6">
              <Image
                src="/global/jinjan.svg"
                alt="Souls In Xtinction"
                fill
                sizes="24px"
                className="object-contain"
              />
            </div>
            <h1 className={`text-xl font-semibold ${infoTextClass}`}>
              {deck.name}
            </h1>
            <span className="h-5 w-px bg-slate-300 dark:bg-slate-600" />
            <span className={infoTextClass}>{nickname}</span>
          </div>
          <div className="flex items-center gap-3 text-base text-slate-700 dark:text-slate-100">
            <span className="flex h-8 items-center rounded-md border border-purple-300/70 bg-purple-100/70 px-2 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:border-purple-300/60 dark:bg-purple-300/15 dark:text-purple-100">
              {archetypeName}
            </span>
            <button
              type="button"
              onClick={handleLikeClick}
              title="Marcar como favorito"
              aria-label="Marcar como favorito"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-purple-300/70 bg-purple-100/70 text-purple-700 shadow-sm transition hover:border-purple-400 hover:text-purple-800 dark:border-purple-300/60 dark:bg-purple-300/15 dark:text-purple-100"
            >
              <span className="relative block h-5 w-5">
                <IoHeart
                  className={clsx(
                    "absolute inset-0 h-5 w-5 text-purple-700 transition-all duration-200 ease-out dark:text-white",
                    liked ? "scale-110 opacity-100" : "scale-75 opacity-0",
                  )}
                />
                <IoHeartOutline
                  className={clsx(
                    "absolute inset-0 h-5 w-5 text-purple-700 transition-all duration-200 ease-out dark:text-white",
                    liked ? "scale-75 opacity-0" : "scale-100 opacity-100",
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className={`flex items-center gap-3 ${subTextClass}`}>
            <p>{playerName}</p>
            <span className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
            <p className="flex items-center gap-2">
              <span className="relative block h-4 w-4">
                <IoHeart
                  className={`absolute inset-0 h-4 w-4 text-purple-600 dark:text-white ${
                    deck.likesCount > 0 ? "opacity-100" : "opacity-0"
                  }`}
                />
                <IoHeartOutline
                  className={`absolute inset-0 h-4 w-4 text-purple-600 dark:text-white ${
                    deck.likesCount > 0 ? "opacity-0" : "opacity-100"
                  }`}
                />
              </span>
              {likesCount} favoritos
            </p>
            <span className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
            <button
              type="button"
              onClick={() => setIsDescriptionOpen((prev) => !prev)}
              className={clsx(
                "flex items-center gap-1",
                subTextClass,
                hoverTextClass,
              )}
            >
              {isDescriptionOpen ? "Ocultar descripción" : "Ver descripción"}
              <IoChevronDownOutline
                className={`transition-transform ${
                  isDescriptionOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {deck.tournamentId && tournamentName ? (
            <Link
              href={`/torneos/${deck.tournamentId}`}
              className={clsx(
                "flex items-center gap-2",
                subTextClass,
                hoverTextClass,
              )}
              title="Ver torneo"
              target="_blank"
              rel="noreferrer"
            >
              <IoTrophy className="text-lg text-amber-400" />
              <span>{tournamentName}</span>
            </Link>
          ) : null}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isDescriptionOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {/* Animamos la altura para revelar la descripción sin reflow brusco */}
            <div className={`mt-4 ${subTextClass}`}>{description}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
