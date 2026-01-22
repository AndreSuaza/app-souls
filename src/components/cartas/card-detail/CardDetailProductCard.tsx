"use client";

import Image from "next/image";
import Link from "next/link";
import { IoOpenOutline } from "react-icons/io5";

interface Product {
  code: string;
  name: string;
  show: boolean;
  url: string;
}

interface Props {
  product: Product;
}

export function CardDetailProductCard({ product }: Props) {
  const content = (
    <div className="group flex flex-col gap-3 rounded-lg border border-purple-600 bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80 dark:shadow-lg sm:flex-row sm:items-center sm:gap-4">
      <div className="w-full overflow-hidden rounded-lg border border-purple-600 bg-slate-100 dark:border-tournament-dark-border dark:bg-slate-950/60 sm:h-16 sm:w-16">
        <Image
          width={320}
          height={200}
          src={`/products/${product.code}.webp`}
          alt={product.name}
          className="h-full w-full object-cover"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
          placeholder="blur"
        />
      </div>
      <div className="flex flex-1 items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            {product.name}
          </p>
          {product.show && (
            <p className="text-xs font-semibold text-indigo-600 dark:text-purple-300">
              Ver en la tienda
            </p>
          )}
        </div>
        {product.show && (
          <IoOpenOutline
            title="Abrir en la tienda"
            className="h-5 w-5 text-slate-500 transition-colors group-hover:text-purple-600 dark:text-slate-300 dark:group-hover:text-purple-600"
          />
        )}
      </div>
    </div>
  );

  if (!product.show) {
    return <div>{content}</div>;
  }

  return (
    <Link href={`/productos/${product.url}`} target="_blank">
      {content}
    </Link>
  );
}
