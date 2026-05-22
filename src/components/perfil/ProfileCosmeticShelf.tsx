"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";

type Props = {
  title: string;
  description: string;
  compactHeight: number;
  children: ReactNode;
};

export const ProfileCosmeticShelf = ({
  title,
  description,
  compactHeight,
  children,
}: Props) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const checkRows = () => {
      setCanExpand(content.scrollHeight > compactHeight + 2);
    };

    checkRows();
    const observer = new ResizeObserver(checkRows);
    observer.observe(content);
    window.addEventListener("resize", checkRows);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkRows);
    };
  }, [compactHeight, children]);

  const handleToggleExpanded = () => {
    setExpanded((value) => {
      if (value) {
        const viewport = viewportRef.current;
        if (viewport) viewport.scrollTop = 0;
      }

      return !value;
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-bg/60 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            {description}
          </p>
        </div>

        {canExpand && (
          <button
            type="button"
            onClick={handleToggleExpanded}
            className="inline-flex w-fit rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-purple-400 hover:text-purple-700 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-purple-100 dark:hover:border-purple-500"
          >
            {expanded ? "Ver menos" : "Ver todos"}
          </button>
        )}
      </div>

      <div
        ref={viewportRef}
        className={clsx(
          "pr-1 transition-[max-height]",
          expanded ? "max-h-[34rem] overflow-y-auto" : "overflow-hidden",
        )}
        style={!expanded ? { maxHeight: compactHeight } : undefined}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    </section>
  );
};
