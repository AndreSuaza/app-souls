"use client";

import { ProductDeckCollection } from "@/components/productos/complete-collection/ProductDeckCollection";
import type { Decklist } from "@/interfaces";

interface Props {
  decklist: Decklist[];
}

export function CataclismoCollectionSection({ decklist }: Props) {
  return (
    <section className="w-full bg-[#120816] px-4 py-10 sm:p-12 md:py-20 md:px-14">
      <div className="mx-auto w-full space-y-6">
        <h2 className="pl-4 text-2xl font-black uppercase tracking-wide text-white sm:text-4xl">
          La colección completa
        </h2>

        <ProductDeckCollection
          decklist={decklist}
          className="rounded-2xl"
          enableTilt
        />
      </div>
    </section>
  );
}
