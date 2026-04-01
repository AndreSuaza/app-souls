"use client";

import type { ProfileTabItem } from "./ProfileSectionsTabs";

type Props = {
  sections: Array<Pick<ProfileTabItem, "id" | "content" | "hidden">>;
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
