"use client";

import clsx from "clsx";
import { useMemo } from "react";
import type { Decklist } from "@/interfaces";
import { MarkdownDeckStackGrid } from "@/components/ui/markdown/MarkdownDeckStackGrid";
import { sortDecklistByTypeOrder } from "@/utils/deck-type-order";

type Props = {
  decklist: Decklist[];
  className?: string;
  placeholder?: string;
  enableTilt?: boolean;
};

export const ProductDeckCollection = ({
  decklist,
  className,
  placeholder = "Este producto aún no tiene mazo asociado.",
  enableTilt = false,
}: Props) => {
  const sortedDecklist = useMemo(
    () => sortDecklistByTypeOrder(decklist ?? []),
    [decklist],
  );

  if (sortedDecklist.length === 0) {
    return (
      <div
        className={clsx(
          "rounded-xl border border-dashed border-tournament-dark-accent bg-tournament-dark-muted/40 p-6 text-center text-sm text-slate-300",
          className,
        )}
      >
        {placeholder}
      </div>
    );
  }

  return (
    <MarkdownDeckStackGrid
      decklist={sortedDecklist}
      className={className}
      variant="product"
      enableTilt={enableTilt}
    />
  );
};
