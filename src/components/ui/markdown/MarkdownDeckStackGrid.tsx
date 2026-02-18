"use client";

import Image from "next/image";
import clsx from "clsx";
import type { Decklist } from "@/interfaces";

type Props = {
  decklist: Decklist[];
  columns?: number;
  className?: string;
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
}: Props) => {
  if (decklist.length === 0) return null;

  const gridClassName = columns
    ? clsx("grid gap-4", getBaseGridClass(columns))
    : clsx(
        "grid gap-4 grid-cols-1",
        "sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6",
      );

  return (
    <ul className={clsx("justify-items-start pb-6", gridClassName, className)}>
      {decklist.map((item) => (
        <li key={item.card.id} className="relative mb-8 overflow-visible">
          <div className="relative w-full max-w-[150px]">
            <Image
              src={`/cards/${item.card.code}-${item.card.idd}.webp`}
              alt={item.card.name}
              width={500}
              height={718}
              className="h-auto w-full rounded-md object-cover"
            />
            {item.count > 1 && (
              <Image
                src={`/cards/${item.card.code}-${item.card.idd}.webp`}
                alt={item.card.name}
                width={500}
                height={718}
                className="absolute left-0 top-0 mt-8 h-auto w-full rounded-md object-cover"
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};
