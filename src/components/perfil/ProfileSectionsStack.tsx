"use client";

import type { ReactNode } from "react";

type Props = {
  sections: Array<{ id: string; content: ReactNode; hidden?: boolean }>;
};

export const ProfileSectionsStack = ({ sections }: Props) => {
  const visibleSections = sections.filter((section) => !section.hidden);

  if (visibleSections.length === 0) return null;

  return (
    <div className="space-y-8">
      {visibleSections.map((section, index) => (
        <div key={section.id} className="space-y-8">
          {index > 0 && (
            <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          )}
          {section.content}
        </div>
      ))}
    </div>
  );
};
