"use client";

import { useEffect, useRef, useState } from "react";
import { IoInformationCircleOutline } from "react-icons/io5";

type Props = {
  text: string;
};

export const ProfileInfoTooltip = ({ text }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <span ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        title={text}
        aria-label={text}
        onClick={() => {
          if (isDesktop) return;
          setIsOpen((prev) => !prev);
        }}
        className="inline-flex cursor-pointer items-center justify-center text-slate-500 transition hover:text-purple-600 dark:text-slate-300"
      >
        <IoInformationCircleOutline className="h-4 w-4" />
      </button>
      {isOpen && (
        <span className="absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-200">
          {text}
        </span>
      )}
    </span>
  );
};
