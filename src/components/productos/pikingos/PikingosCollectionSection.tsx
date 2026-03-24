"use client";

import { ProductDeckCollection } from "@/components/productos/complete-collection/ProductDeckCollection";
import type { Decklist } from "@/interfaces";

interface Props {
  decklist: Decklist[];
}

export function PikingosCollectionSection({ decklist }: Props) {
  return (
    <>
      {/* Referencia modo light: bg-white/10 y titulo text-slate-900 */}
      <section className="w-full bg-purple-950/40 px-4 py-10 sm:p-12 md:py-20 md:px-14 backdrop-blur-sm">
        <div className="mx-auto w-full space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-wide text-white sm:text-4xl pl-4">
            La colección completa
          </h2>

          <ProductDeckCollection decklist={decklist} className="rounded-2xl" />
        </div>
      </section>
    </>
  );
}
