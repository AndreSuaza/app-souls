"use client";

import type { ReactElement, ReactNode } from "react";
import clsx from "clsx";

export type ProfileTab = "tournament" | "history" | "decks" | "selected";

export type ProfileTabItem = {
  id: ProfileTab;
  label: string;
  icon: ReactElement;
  content: ReactNode;
  hidden?: boolean;
};

type Props = {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
  tabs: ProfileTabItem[];
};

export const ProfileSectionsTabs = ({ active, onChange, tabs }: Props) => {
  const visibleTabs = tabs.filter((tab) => !tab.hidden);
  const activeTab =
    visibleTabs.find((tab) => tab.id === active) ?? visibleTabs[0];

  if (!activeTab) return null;

  return (
    <div id="perfil-tabs" className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 dark:border-tournament-dark-border">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={clsx(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition",
              activeTab.id === tab.id
                ? "border-purple-300/60 bg-purple-100 text-purple-700 shadow-sm dark:border-purple-500/60 dark:bg-purple-500/15 dark:text-purple-100"
                : "border-transparent bg-slate-100 text-slate-600 hover:border-purple-300/40 hover:text-purple-700 dark:bg-tournament-dark-muted dark:text-slate-300 dark:hover:border-purple-500/40 dark:hover:text-purple-200",
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-tournament-dark-border dark:bg-tournament-dark-surface/60">
        {activeTab.content}
      </div>
    </div>
  );
};
