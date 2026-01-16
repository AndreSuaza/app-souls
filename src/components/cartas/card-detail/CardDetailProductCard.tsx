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
    <div className="flex items-center gap-4 rounded-2xl border border-purple-600 bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80 dark:shadow-lg">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-purple-600 bg-slate-100 dark:border-tournament-dark-border dark:bg-slate-950/60">
        <Image
          width={60}
          height={60}
          src={`/products/${product.code}.webp`}
          alt={product.name}
          className="rounded-lg object-cover"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
          placeholder="blur"
        />
      </div>
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
        <IoOpenOutline className="h-5 w-5 text-slate-500 dark:text-slate-300" />
      )}
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
