"use client";

import React from "react";
import { useUIStore } from "@/store/ui/ui-store";
import Image from "next/image";

export const LoadingOverlay: React.FC = () => {
  const isLoading = useUIStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div
      className="
      fixed inset-0 z-[9999]
      bg-gray-200/10 backdrop-blur-0
      flex items-center justify-center
      pointer-events-auto
    "
    >
      <div className="relative flex flex-col items-center gap-4">
        {/* aura pulsante */}
        <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl animate-pulse"></div>

        {/* icono */}
        <div className="relative animate-spin drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]">
          <Image
            src="/global/jinjan.svg"
            width={90}
            height={90}
            alt="loading"
          />
        </div>

        {/* texto */}
        <p className="text-black/80 text-sm tracking-wide">Procesando ronda…</p>
      </div>
    </div>
  );
};
