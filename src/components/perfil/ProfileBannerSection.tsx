"use client";

import Image from "next/image";
import { IoImagesOutline } from "react-icons/io5";
import { ProfileCosmeticShelf } from "./ProfileCosmeticShelf";
import type { ProfileCosmeticItem } from "./ProfileSection.types";
import {
  getProfileBannerUrl,
  getProfileBannerValue,
} from "@/utils/profile-banner";

type Props = {
  selectedBanner: string;
  bannerItems: ProfileCosmeticItem[];
  hasChanges: boolean;
  onSelectBanner: (banner: ProfileCosmeticItem) => void;
  onCancel: () => void;
  onSave: () => void;
};

export const ProfileBannerSection = ({
  selectedBanner,
  bannerItems,
  hasChanges,
  onSelectBanner,
  onCancel,
  onSave,
}: Props) => {
  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70 sm:p-6">
      <div className="relative min-h-[260px] overflow-hidden rounded-3xl border border-slate-200 dark:border-tournament-dark-border">
        <Image
          src={getProfileBannerUrl(selectedBanner)}
          alt="Fondo actual del perfil"
          title="Fondo actual del perfil"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
        <div className="relative z-10 flex min-h-[260px] max-w-xl flex-col justify-end p-6 text-white">
          <IoImagesOutline className="h-10 w-10 text-purple-200" />
          <h3 className="mt-4 text-2xl font-semibold">Fondo del perfil</h3>
          <p className="mt-2 text-sm text-purple-100">
            Controla la imagen principal que acompana el encabezado publico del
            perfil.
          </p>
        </div>
      </div>

      <ProfileCosmeticShelf
        title="Tus fondos"
        description="Selecciona el banner que aparece en el encabezado del perfil."
        compactHeight={216}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bannerItems.map((banner) => {
            const bannerValue = getProfileBannerValue(banner.imageUrl);
            const isSelected = selectedBanner === bannerValue;

            return (
              <button
                key={banner.id}
                type="button"
                onClick={() => onSelectBanner(banner)}
                title={`Seleccionar fondo ${banner.name}`}
                className={`box-border flex h-[200px] min-w-0 flex-col rounded-2xl border-2 p-3 text-left transition ${
                  isSelected
                    ? "border-purple-500 bg-purple-100 shadow-[0_0_24px_rgba(147,51,234,0.28)] dark:bg-purple-500/15"
                    : "border-transparent bg-white hover:border-purple-400 dark:bg-tournament-dark-surface dark:hover:border-purple-500"
                }`}
              >
                <Image
                  src={getProfileBannerUrl(banner.imageUrl)}
                  alt={banner.name}
                  width={1200}
                  height={500}
                  className="h-36 w-full rounded-xl object-cover"
                />
                <span className="mt-3 truncate text-sm font-semibold text-slate-800 dark:text-white">
                  {banner.name}
                </span>
              </button>
            );
          })}
        </div>
      </ProfileCosmeticShelf>

      <div className="flex flex-wrap justify-start gap-3 border-t border-slate-200 pt-5 dark:border-tournament-dark-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={!hasChanges}
          className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-slate-600 transition hover:border-purple-400 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-tournament-dark-border dark:text-slate-200 dark:hover:border-purple-500"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!hasChanges}
          className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-purple-900/40 disabled:text-slate-400"
        >
          Guardar
        </button>
      </div>
    </section>
  );
};
