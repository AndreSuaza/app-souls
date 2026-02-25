"use client";

import Image from "next/image";

type Props = {
  src?: string;
  alt?: string;
};

export const MarkdownProductPreview = ({ src, alt }: Props) => {
  if (!src) return null;

  return (
    <div className="w-[220px] sm:w-[260px] md:w-[300px]">
      <div className="rounded-lg border border-transparent bg-white p-2 text-center shadow-sm transition hover:border-purple-400 dark:bg-tournament-dark-surface">
        <div className="content-visibility-auto h-[260px] overflow-hidden rounded-md bg-slate-950/70 dark:bg-tournament-dark-muted-strong/40 sm:h-[300px] md:h-[340px]">
          <Image
            src={src}
            alt={alt ?? "Producto"}
            width={300}
            height={340}
            className="h-full w-full rounded-md object-cover"
          />
        </div>
        <span className="mt-2 block truncate text-xs text-slate-500 dark:text-slate-400">
          {alt ?? "Producto"}
        </span>
      </div>
    </div>
  );
};
