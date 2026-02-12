"use client";

import Image from "next/image";

type Props = {
  src?: string;
  alt?: string;
};

export const MarkdownCardImage = ({ src, alt }: Props) => {
  if (!src) return null;

  return (
    <div className="w-[140px] sm:w-[170px] md:w-[190px]">
      <div className="relative rounded-lg bg-slate-950/70 shadow-sm dark:bg-tournament-dark-muted-strong/40">
        <div className="content-visibility-auto overflow-hidden rounded-lg">
          <Image
            src={src}
            alt={alt ?? "Carta"}
            className="block h-auto w-full object-cover"
            width={500}
            height={718}
          />
        </div>
      </div>
    </div>
  );
};
