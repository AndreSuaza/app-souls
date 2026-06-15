"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

type Props = Omit<ImageProps, "src" | "onError"> & {
  src?: ImageProps["src"] | null;
  fallbackSrc: string;
};

export const FallbackImage = ({
  src,
  fallbackSrc,
  alt,
  ...props
}: Props) => {
  const [currentSrc, setCurrentSrc] = useState<ImageProps["src"]>(
    src || fallbackSrc,
  );

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [fallbackSrc, src]);

  return (
    <Image
      {...props}
      alt={alt}
      src={currentSrc}
      onError={() => {
        if (currentSrc === fallbackSrc) return;
        setCurrentSrc(fallbackSrc);
      }}
    />
  );
};
