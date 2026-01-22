import type { MouseEvent } from "react";
import { Card } from "@/interfaces";
import Image from "next/image";
import { IoAddCircleOutline, IoRemoveCircleOutline } from "react-icons/io5";

interface Props {
  count: number;
  card: Card;
  dropCard?: (c: Card) => void;
  addCard?: (c: Card) => void;
  onOpenDetail?: () => void;
}

export const CardItemList = ({
  card,
  count,
  dropCard,
  addCard,
  onOpenDetail,
}: Props) => {
  const handleAdd = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    addCard?.(card);
  };

  const handleDrop = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    dropCard?.(card);
  };

  // const openCardDetail = useCardDetailStore( state => state.openCardDetail);
  // const isCardDetailOpen = useCardDetailStore( state => state.isCardDetailOpen);

  // const openDetail = () => {
  //     openCardDetail();
  //     detailCard(index);
  // }

  const actionButtonClass =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/30 text-purple-600 shadow-sm backdrop-blur-sm transition hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80 dark:text-purple-200";
  const removeButtonClass =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/40 text-amber-600 shadow-sm backdrop-blur transition hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80 dark:text-amber-200";

  return (
    <div
      className="flex relative transition-all hover:-mt-2"
      onClick={onOpenDetail}
      role={onOpenDetail ? "button" : undefined}
      tabIndex={onOpenDetail ? 0 : undefined}
    >
      <Image
        src={`/cards/${card.code}-${card.idd}.webp`}
        className="rounded-md"
        alt={card.name}
        width={500}
        height={718}
      />
      <div className="absolute top-8 -right-2 z-[1] flex flex-col items-center gap-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/30 text-emerald-700 text-xs font-semibold shadow-sm backdrop-blur-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80 dark:text-emerald-200">
          {count}
        </div>
        {addCard && (
          <button
            type="button"
            className={actionButtonClass}
            title="Anadir carta"
            onClick={handleAdd}
          >
            <IoAddCircleOutline className="h-5 w-5" />
          </button>
        )}
        {dropCard && (
          <button
            type="button"
            className={removeButtonClass}
            title="Quitar carta"
            onClick={handleDrop}
          >
            <IoRemoveCircleOutline className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};
