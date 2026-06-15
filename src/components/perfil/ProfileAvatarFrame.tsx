"use client";

import Image from "next/image";
import { PLAYER_PROFILE_FRAMES_ENABLED } from "@/config/features";

type ProfileAvatarFrameProps = {
  avatarSrc: string;
  avatarAlt: string;
  avatarTitle?: string;
  frameSrc?: string;
  className?: string;
  avatarClassName?: string;
};

export const ProfileAvatarFrame = ({
  avatarSrc,
  avatarAlt,
  avatarTitle,
  frameSrc,
  className = "",
  avatarClassName = "",
}: ProfileAvatarFrameProps) => {
  const hasFrame = PLAYER_PROFILE_FRAMES_ENABLED && Boolean(frameSrc);

  return (
    <div
      className={`relative h-32 w-32 shrink-0 overflow-visible sm:h-36 sm:w-36 ${className}`}
    >
      {hasFrame && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[118%] w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/25 blur-2xl" />
      )}

      <div
        className={`relative z-10 h-full w-full overflow-hidden rounded-full ${
          hasFrame
            ? "border border-purple-200/50 shadow-[0_0_18px_rgba(147,51,234,0.35)]"
            : "border-4 border-purple-500 shadow-[0_0_25px_rgba(147,51,234,0.45)]"
        }`}
      >
        <Image
          src={avatarSrc}
          alt={avatarAlt}
          title={avatarTitle}
          width={220}
          height={220}
          className={`h-full w-full object-cover ${avatarClassName}`}
        />
      </div>

      {hasFrame && (
        <Image
          src={frameSrc || ""}
          alt="Marco de avatar"
          title="Marco de avatar"
          width={260}
          height={260}
          unoptimized
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[136%] w-[136%] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
        />
      )}
    </div>
  );
};
