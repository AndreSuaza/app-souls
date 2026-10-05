"use client";

import { ProductDeckCollection } from "@/components/productos/complete-collection/ProductDeckCollection";
import type { Decklist } from "@/interfaces";

interface ObsidianaCollectionSectionProps {
  decklist: Decklist[];
}

export function ObsidianaCollectionSection({
  decklist,
}: ObsidianaCollectionSectionProps) {
  return (
    <section
      id="obsidiana-y-tempestad-collection"
      className="scroll-mt-24 bg-[#063a3a]/60 px-4 py-10 sm:p-12 md:px-14 md:py-20"
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
