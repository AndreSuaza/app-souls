"use client";

import { ProductDeckCollection } from "@/components/productos/complete-collection/ProductDeckCollection";
import type { Decklist } from "@/interfaces";

interface AvanceEtereoCollectionSectionProps {
  decklist: Decklist[];
}

export function AvanceEtereoCollectionSection({
  decklist,
}: AvanceEtereoCollectionSectionProps) {
  return (
    <section
      id="avance-etereo-collection"
      className="scroll-mt-24 bg-[#081018] px-4 py-10 sm:p-12 md:px-14 md:py-20"
    >
      <div className="mx-auto w-full space-y-6">
        <h2 className="pl-4 text-2xl font-black uppercase tracking-wide text-white sm:text-4xl">
          La colección completa
        </h2>

        <ProductDeckCollection decklist={decklist} className="rounded-2xl" />
      </div>
    </section>
  );
}
