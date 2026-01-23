"use client";

import { CompleteCollection } from "@/components/productos/complete-collection/CompleteCollection";
import { Card } from "@/interfaces";

interface Props {
  cards: Card[];
}

export function PikingosCollectionSection({ cards }: Props) {
  return (
    <>
      {/* Referencia modo light: bg-white/10 y titulo text-slate-900 */}
      <section className="w-full bg-purple-950/40 px-4 py-10 sm:p-12 md:p-20 backdrop-blur-sm">
        <div className="mx-auto w-full space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-wide text-white sm:text-4xl pl-4">
            La colección completa
          </h2>

          <CompleteCollection
            cards={cards}
            className="rounded-2xl"
            backgroundVariant="showcase"
          />
        </div>
      </section>
    </>
  );
}
