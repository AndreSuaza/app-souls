"use client";

import clsx from "clsx";
import type { Decklist } from "@/interfaces";
import { MarkdownDeckStackGrid } from "@/components/ui/markdown/MarkdownDeckStackGrid";

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
  if (!decklist || decklist.length === 0) {
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
      decklist={decklist}
      className={className}
      variant="product"
      enableTilt={enableTilt}
    />
  );
};
