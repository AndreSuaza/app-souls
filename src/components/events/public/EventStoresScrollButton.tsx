"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  targetId?: string;
};

export const EventStoresScrollButton = ({
  children,
  className,
  targetId = "tiendas-asociadas",
}: Props) => (
  <button
    type="button"
    onClick={() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }}
    className={className}
  >
    {children}
  </button>
);
