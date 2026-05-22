"use client";

import Image from "next/image";
import { IoPersonCircleOutline } from "react-icons/io5";
import { ProfileAvatarFrame } from "./ProfileAvatarFrame";
import { ProfileCosmeticShelf } from "./ProfileCosmeticShelf";
import type { ProfileCosmeticItem } from "./ProfileSection.types";
import { getAvatarUrl, getAvatarValue } from "@/utils/avatar-image";
import { getProfileFrameUrl, getProfileFrameValue } from "@/utils/profile-frame";

type Props = {
  userImage?: string | null;
  selectedAvatar: string;
  selectedFrame: string;
  avatarItems: ProfileCosmeticItem[];
  frameItems: ProfileCosmeticItem[];
  hasChanges: boolean;
  onSelectAvatar: (avatar: ProfileCosmeticItem) => void;
  onSelectFrame: (frame: ProfileCosmeticItem | null) => void;
  onCancel: () => void;
  onSave: () => void;
};

export const ProfileAvatarSection = ({
  userImage,
  selectedAvatar,
  selectedFrame,
  avatarItems,
  frameItems,
  hasChanges,
  onSelectAvatar,
  onSelectFrame,
  onCancel,
  onSave,
}: Props) => {
  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70 sm:p-6">
      <div className="grid gap-5 rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5 dark:border-purple-500/30 dark:from-purple-950/30 dark:to-tournament-dark-bg lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/60">
          <ProfileAvatarFrame
            avatarSrc={getAvatarUrl(selectedAvatar || userImage)}
            avatarAlt="Avatar actual"
            avatarTitle="Avatar actual"
            frameSrc={selectedFrame ? getProfileFrameUrl(selectedFrame) : undefined}
          />
          <p className="mt-5 text-sm font-semibold text-slate-800 dark:text-white">
            Avatar actual
          </p>
          <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
            Vista previa del avatar y marco seleccionado.
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <IoPersonCircleOutline className="h-10 w-10 text-purple-600 dark:text-purple-300" />
          <h3 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
            Avatar y marco
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Selecciona la imagen principal del perfil y el marco que la rodea.
          </p>
        </div>
      </div>

      <ProfileCosmeticShelf
        title="Tus avatares"
        description="La primera fila queda visible para cambiar rapido de avatar."
        compactHeight={228}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {avatarItems.map((avatar) => {
            const avatarValue = getAvatarValue(avatar.imageUrl);
            const isSelected = selectedAvatar === avatarValue;

            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => onSelectAvatar(avatar)}
                title={`Seleccionar avatar ${avatar.name}`}
                className={`box-border flex h-[218px] min-w-0 flex-col rounded-2xl border-2 p-3 text-left transition ${
                  isSelected
                    ? "border-purple-500 bg-purple-100 shadow-[0_0_24px_rgba(147,51,234,0.28)] dark:bg-purple-500/15"
                    : "border-transparent bg-white hover:border-purple-400 dark:bg-tournament-dark-surface dark:hover:border-purple-500"
                }`}
              >
                <Image
                  src={getAvatarUrl(avatar.imageUrl)}
                  alt={avatar.name}
                  width={220}
                  height={220}
                  className="h-40 w-full rounded-xl object-cover"
                />
                <span className="mt-3 truncate text-sm font-semibold text-slate-800 dark:text-white">
                  {avatar.name}
                </span>
              </button>
            );
          })}
        </div>
      </ProfileCosmeticShelf>

      <ProfileCosmeticShelf
        title="Tus marcos"
        description="Selecciona un marco o conserva el avatar sin marco."
        compactHeight={228}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <button
            type="button"
            onClick={() => onSelectFrame(null)}
            title="Quitar marco"
            className={`box-border flex h-[218px] min-w-0 flex-col items-center justify-between rounded-2xl border-2 p-3 transition ${
              !selectedFrame
                ? "border-purple-500 bg-purple-100 shadow-[0_0_24px_rgba(147,51,234,0.28)] dark:bg-purple-500/15"
                : "border-transparent bg-white hover:border-purple-400 dark:bg-tournament-dark-surface dark:hover:border-purple-500"
            }`}
          >
            <span className="flex h-40 w-full items-center justify-center rounded-xl bg-slate-100 dark:bg-tournament-dark-muted">
              <IoPersonCircleOutline className="h-24 w-24 text-slate-500 dark:text-slate-300" />
            </span>
            <span className="mt-3 truncate text-sm font-semibold text-slate-800 dark:text-white">
              Sin marco
            </span>
          </button>

          {frameItems.map((frame) => {
            const frameValue = getProfileFrameValue(frame.imageUrl);
            const isSelected = selectedFrame === frameValue;

            return (
              <button
                key={frame.id}
                type="button"
                onClick={() => onSelectFrame(frame)}
                title={`Seleccionar marco ${frame.name}`}
                className={`box-border flex h-[218px] min-w-0 flex-col rounded-2xl border-2 p-3 text-left transition ${
                  isSelected
                    ? "border-purple-500 bg-purple-100 shadow-[0_0_24px_rgba(147,51,234,0.28)] dark:bg-purple-500/15"
                    : "border-transparent bg-white hover:border-purple-400 dark:bg-tournament-dark-surface dark:hover:border-purple-500"
                }`}
              >
                <span className="flex h-40 w-full items-center justify-center rounded-xl bg-slate-100 dark:bg-tournament-dark-muted">
                  <Image
                    src={getProfileFrameUrl(frame.imageUrl)}
                    alt={frame.name}
                    width={220}
                    height={220}
                    unoptimized
                    className="h-full w-full object-contain"
                  />
                </span>
                <span className="mt-3 truncate text-sm font-semibold text-slate-800 dark:text-white">
                  {frame.name}
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
