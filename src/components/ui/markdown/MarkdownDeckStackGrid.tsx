"use client";

import Image from "next/image";
import { cardImageBlurDataURL } from "@/models/images.models";
import clsx from "clsx";
import type { Decklist } from "@/interfaces";
import { useState } from "react";
import { CardDetail } from "@/components/cartas/card-detail/CardDetail";
import { TiltCard } from "@/components/ui/tilt/TiltCard";

type Props = {
  decklist: Decklist[];
  columns?: number;
  className?: string;
  variant?: "default" | "product";
  enableTilt?: boolean;
};

const getBaseGridClass = (value: number) => {
  switch (value) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-3";
    case 4:
      return "grid-cols-4";
    case 5:
      return "grid-cols-5";
    case 7:
      return "grid-cols-7";
    case 8:
      return "grid-cols-8";
    default:
      return "grid-cols-6";
  }
};

export const MarkdownDeckStackGrid = ({
  decklist,
  columns,
  className,
  variant = "default",
  enableTilt = false,
}: Props) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const detailCards = decklist.map((item) => item.card);

  if (decklist.length === 0) return null;

  const productStackOffsets = [
    "mt-0",
    "mt-4",
    "mt-8",
    "mt-12",
    "mt-16",
    "mt-20",
    "mt-24",
  ];
  const productStackPadding = [
    "pb-0",
    "pb-4",
    "pb-8",
    "pb-12",
    "pb-16",
    "pb-20",
    "pb-24",
  ];
  const defaultStackOffsets = ["mt-0", "mt-8"];
  const gridClassName = columns
    ? clsx("grid gap-4", getBaseGridClass(columns))
    : variant === "product"
      ? clsx(
          "grid gap-3 grid-cols-2",
          "sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9",
          "mx-2",
        )
      : clsx(
          "grid gap-4 grid-cols-1",
          "sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6",
        );

  const cardContainerClass =
    variant === "product" ? "relative w-full" : "relative w-full max-w-[150px]";
  const cardItemClass =
    variant === "product" ? "relative mb-3" : "relative mb-4";
  const cardImageClass =
    variant === "product"
      ? "h-auto w-full rounded-lg object-cover"
      : "h-auto w-full rounded-md object-cover";

  const handleOpenDetail = (index: number) => {
    setActiveIndex(index);
    setIsDetailOpen(true);
  };

  return (
    <>
      <ul className={clsx("justify-items-start pb-6", gridClassName, className)}>
        {decklist.map((item, index) => {
          const stackLayers =
            variant === "product"
              ? Math.min(item.count, productStackOffsets.length)
              : Math.min(item.count, defaultStackOffsets.length);
          const stackPaddingClass =
            variant === "product"
              ? (productStackPadding[stackLayers - 1] ?? "pb-0")
              : "";

          const content = (
            <button
              type="button"
              onClick={() => handleOpenDetail(index)}
              className={clsx(
                enableTilt ? "block w-full text-left" : cardContainerClass,
                "block text-left",
              )}
              title={`Ver carta ${item.card.name}`}
            >
              {(() => {
                const offsets =
                  variant === "product"
                    ? productStackOffsets
                    : defaultStackOffsets;
                // Limitamos el numero de capas para evitar stacks demasiado altos.
                const maxLayers = Math.min(item.count, offsets.length);

                return Array.from({ length: maxLayers }).map((_, index) => {
                  const isBase = index === 0;
                  return (
                    <Image
                      key={`${item.card.id}-${index}`}
                      src={`/cards/${item.card.code}-${item.card.idd}.webp`}
                      alt={item.card.name}
                      title={item.card.name}
                      placeholder="blur"
                      blurDataURL={cardImageBlurDataURL}
                      width={500}
                      height={718}
                      className={clsx(
                        cardImageClass,
                        isBase ? "" : "absolute left-0 top-0",
                        offsets[index],
                      )}
                    />
                  );
                });
              })()}
            </button>
          );

          return (
            <li
              key={`${item.card.id}-${index}`}
              className={clsx(
                cardItemClass,
                stackPaddingClass,
                "overflow-visible",
              )}
            >
              {enableTilt ? (
                <TiltCard className={cardContainerClass}>{content}</TiltCard>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>

      {isDetailOpen && (
        <CardDetail
          cards={detailCards}
          indexList={activeIndex}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </>
  );
};
