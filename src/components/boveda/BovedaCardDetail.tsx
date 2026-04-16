"use client";

import Image from "next/image";
import { cardImageBlurDataURL } from "@/models/images.models";
import { CardDetailStatCard } from "@/components/cartas/card-detail/CardDetailStatCard";
import { CardDetailProductCard } from "@/components/cartas/card-detail/CardDetailProductCard";
import { BovedaPriceCard } from "./BovedaPriceCard";
import { TiltCard } from "@/components/ui/tilt/TiltCard";

interface DetailCard {
  id: string;
  idd: string;
  code: string;
  name: string;
  cost: number;
  force: string;
  defense: string;
  limit: string;
  effect: string;
  price: number | null;
  types: { name: string }[];
  archetypes: { name: string }[];
  rarities: { name: string }[];
  keywords: { name: string }[];
  product: {
    name: string;
    code: string;
    show: boolean;
    url: string;
  };
  relatedProducts: {
    name: string;
    code: string;
    show: boolean;
    url: string;
  }[];
}

interface Props {
  card: DetailCard;
}

export function BovedaCardDetail({ card }: Props) {
  const typeText = card.types.map((type) => type.name).join(", ");
  const archetypeText = card.archetypes.map((arch) => arch.name).join(", ");
  const rarityText = card.rarities.map((rarity) => rarity.name).join(", ");
  const keywordsText = card.keywords
    .map((keyword) => keyword.name?.trim())
    .filter((name): name is string => Boolean(name))
    .join(", ");

  const stats = [
    { label: "Código", value: card.code },
    { label: "Tipo", value: typeText },
    { label: "Coste", value: `${card.cost}` },
    { label: "Fuerza", value: card.force },
    { label: "Defensa", value: card.defense },
    { label: "Arquetipo", value: archetypeText },
    { label: "Rareza", value: rarityText },
  ].filter((item) => item.value.length > 0);

  const priceFormatter = new Intl.NumberFormat("es-CO");
  const priceText =
    card.price != null ? `$${priceFormatter.format(card.price)}` : "Sin precio";

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white md:hidden">
        {card.name}
      </h2>

      <div className="flex justify-center">
        <div className="w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[400px]">
          <TiltCard className="w-full">
            <div className="relative w-full aspect-[500/718] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
              <Image
                src={`/cards/${card.code}-${card.idd}.webp`}
                alt={card.name}
                title={card.name}
                placeholder="blur"
                blurDataURL={cardImageBlurDataURL}
                fill
                sizes="(min-width: 1024px) 520px, (min-width: 640px) 480px, 90vw"
                className="object-fill"
              />
            </div>
          </TiltCard>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="hidden text-3xl font-extrabold text-slate-900 dark:text-white md:block">
          {card.name}
        </h2>

        <div className="grid gap-6 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="relative w-full">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {stats.map((item) => (
                  <CardDetailStatCard
                    key={item.label}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>

              {keywordsText && (
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Palabras clave
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    {keywordsText}
                  </p>
                </div>
              )}

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Efecto de habilidad
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {card.effect || "Sin efecto"}
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Productos donde puedes encontrar esta carta
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {card.relatedProducts.map((product) => (
                    <CardDetailProductCard
                      key={product.code}
                      product={product}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/*
              Mostrar mas / Mostrar menos removido a pedido.
              Se deja comentado por si se requiere nuevamente en el futuro.
            */}
          </div>

          <div className="space-y-4">
            <BovedaPriceCard
              priceLabel="Precio actual"
              priceValue={priceText}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
