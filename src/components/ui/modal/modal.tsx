"use client";

import { JSX, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";

interface Props {
  children: JSX.Element;
  className: string;
  close: () => void;
}

export const Modal = ({ children, className, close }: Props) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    // Bloquea el scroll del body mientras el modal esta abierto.
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <>
      <div
        onClick={close}
        className="fade-in fixed top-0 left-0 z-10 h-screen w-screen bg-black/40 backdrop-blur-sm"
      />

      <div className={`fixed z-20 ${className}`}>
        <button
          type="button"
          aria-label="Cerrar modal"
          onClick={close}
          className="absolute right-5 top-3 flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-slate-600 transition hover:border-purple-400 hover:text-purple-600 dark:border dark:border-tournament-dark-border dark:bg-slate-950/80 dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
        >
          <IoCloseOutline className="h-6 w-6" />
        </button>
        {children}
      </div>
    </>
  );
};
