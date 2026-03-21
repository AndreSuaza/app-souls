"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "../../../interfaces/products.interface";

interface Props {
  product: Product;
}

const resolveProductImage = (value?: string | null) => {
  if (!value) return null;
  if (value.startsWith("http")) return value;
  return `/products/${value}.webp`;
};

export const ProductItem = ({ product }: Props) => {
  const imageUrl = resolveProductImage(product.ProductImage[0]?.url ?? null);
  const priceText =
    typeof product.price === "number"
      ? `$${product.price.toLocaleString("es-CO")}`
      : "Sin precio";
  const releaseText = product.releaseDate
    ? product.releaseDate.toUpperCase()
    : "SIN FECHA";

  return (
    <Link
      href={`/productos/${product.url}`}
      className="group block h-full"
      aria-label={`Ver producto ${product.name}`}
      title={`Ver producto ${product.name}`}
    >
      <article className="flex max-w-72 h-full flex-col overflow-hidden rounded-lg border border-tournament-dark-accent bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:border-purple-400 hover:shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <div className="flex h-64 items-center justify-center bg-slate-100 dark:bg-tournament-dark-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              title={product.name}
              className="h-full w-full object-full"
              width={520}
              height={420}
            />
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Sin imagen
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 bg-gradient-to-b from-white to-slate-50 p-4 text-center dark:from-tournament-dark-surface dark:to-tournament-dark-muted-strong space-y-4">
          <h3 className="min-h-[56px] text-sm font-semibold uppercase tracking-[0.2em] text-slate-800 dark:text-slate-100 md:text-base">
            {product.name}
          </h3>

          <div className="border-t border-slate-200/80 pt-4 text-xs uppercase tracking-[0.2em] text-slate-500 dark:border-tournament-dark-border dark:text-slate-400">
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
              <div className="flex flex-col text-left gap-1">
                <span>Precio</span>
                <span className="text-base font-bold text-purple-600 dark:text-purple-300">
                  {priceText}
                </span>
              </div>
              <span className="h-10 w-px bg-slate-200 dark:bg-tournament-dark-border" />
              <div className="flex flex-col text-right gap-1">
                <span>Lanzamiento</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {releaseText}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};
