import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  rightSlot?: ReactNode;
};

export const ProfileSectionHeader = ({
  title,
  description,
  rightSlot,
}: Props) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-600 dark:text-purple-300">
            Perfil
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        {rightSlot}
      </div>
    </div>
  );
};
